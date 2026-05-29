pipeline {
    agent any

    environment {
        DOTNET_CLI_HOME = "${WORKSPACE}\\.dotnet"
        API_URL = "http://localhost:5020"
        NEWMAN_CMD = "C:\\Users\\LENOVO\\AppData\\Roaming\\npm\\newman.cmd"
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                echo '=== Tải mã nguồn mới nhất ==='
                cleanWs()
                checkout scm
            }
        }

        stage('2. Restore & Build Backend') {
            steps {
                echo '=== Restore & Build .NET Backend ==='

                powershell '''
                    dotnet restore HomeDecorShop/HomeDecorShop.sln
                    dotnet build HomeDecorShop/HomeDecorShop.sln `
                        --configuration Release `
                        --no-restore
                '''
            }
        }

        stage('3. Run C# Unit Tests') {
            steps {
                echo '=== Chạy Unit Test xUnit ==='

                powershell '''
                    dotnet test HomeDecorShop/HomeDecorShop.Tests/HomeDecorShop.Tests.csproj `
                        --configuration Release `
                        --logger "trx;LogFileName=unittest-results.trx" `
                        --collect:"XPlat Code Coverage"
                '''
            }

            post {
                always {
                    echo '=== Lưu kết quả Unit Test ==='

                    archiveArtifacts artifacts: '**/TestResults/*.trx', allowEmptyArchive: true
                }
            }
        }

        stage('4. Start DB & Backend') {
            steps {

                echo '=== Dọn môi trường cũ ==='

                powershell '''
                    Stop-Process -Name dotnet -Force -ErrorAction SilentlyContinue
                    docker compose -f docker-compose.sql.yml down
                    docker rm -f beeshop-sql 2>$null
                '''

                echo '=== Khởi động SQL Server ==='

                powershell '''
                    docker compose -f docker-compose.sql.yml up -d
                '''

                echo '=== Chờ SQL Server sẵn sàng ==='

                powershell '''
                    Start-Sleep -Seconds 30
                '''

                echo '=== Khởi động Backend API ngầm ==='

                powershell '''
                    Start-Process `
                        -FilePath "dotnet" `
                        -ArgumentList "run --project HomeDecorShop/HomeDecorShop.API/HomeDecorShop.API.csproj --urls http://localhost:5020" `
                        -WindowStyle Hidden
                '''

                echo '=== Kiểm tra API ==='

                powershell '''
                    $ready = $false

                    for ($i = 0; $i -lt 30; $i++) {
                        try {
                            Invoke-WebRequest http://localhost:5020/swagger -UseBasicParsing
                            $ready = $true
                            break
                        }
                        catch {
                            Write-Host "API chua san sang... retry"
                            Start-Sleep -Seconds 2
                        }
                    }

                    if (-not $ready) {
                        Write-Host "API startup failed"
                        exit 1
                    }

                    Write-Host "API da san sang"
                '''

                echo '=== Seed dữ liệu ==='

                powershell '''
                    try {
                        $response = Invoke-RestMethod `
                            -Method Post `
                            -Uri http://localhost:5020/api/Maintenance/seed/all

                        Write-Host "Seed thanh cong"
                        Write-Host $response
                    }
                    catch {
                        Write-Host "Seed that bai"
                        Write-Host $_
                        exit 1
                    }
                '''
            }
        }

        stage('5. Run Newman API Tests') {

            steps {

                echo '=== Tạo thư mục report ==='

                powershell '''
                    New-Item `
                        -ItemType Directory `
                        -Force `
                        -Path newman-results
                '''

                echo '=== Chạy Newman ==='

                powershell '''
                    & "C:\\Users\\LENOVO\\AppData\\Roaming\\npm\\newman.cmd" run `
                        HomeDecorShop/HomeDecorShop_Postman.json `
                        --env-var "url=http://localhost:5020" `
                        --reporters cli,junit,html `
                        --reporter-junit-export newman-results/newman-report.xml `
                        --reporter-html-export newman-results/newman-report.html
                '''
            }

            post {

                always {

                    echo '=== Publish Newman Reports ==='

                    script {

                        try {
                            junit 'newman-results/newman-report.xml'
                        }
                        catch (Exception e) {
                            echo "WARNING: Khong tim thay JUnit report."
                        }

                        try {
                            publishHTML([
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'newman-results',
                                reportFiles: 'newman-report.html',
                                reportName: 'Newman API Report'
                            ])
                        }
                        catch (Exception e) {
                            echo "WARNING: HTML Publisher plugin missing."
                        }
                    }
                }
            }
        }
    }

    post {

        always {

            echo '=== Cleanup ==='

            powershell '''
                Stop-Process -Name dotnet -Force -ErrorAction SilentlyContinue
                docker compose -f docker-compose.sql.yml down
                docker rm -f beeshop-sql 2>$null
            '''
        }

        success {
            echo '=== BUILD + API TEST + UNIT TEST THÀNH CÔNG 🎉 ==='
        }

        failure {
            echo '=== BUILD HOẶC TEST THẤT BẠI ❌ ==='
        }
    }
}