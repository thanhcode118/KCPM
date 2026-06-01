pipeline {
    agent any

    environment {
        DOTNET_CLI_HOME = "${WORKSPACE}\\.dotnet"
        API_URL = "http://localhost:5020"
        NEWMAN_CMD = "C:\\Users\\thanh\\AppData\\Roaming\\npm\\newman.cmd"

        // ===== JIRA INTEGRATION =====
        JIRA_BASE_URL    = 'https://nguyenhathanh844.atlassian.net'
        JIRA_PROJECT_KEY = 'HOM'
        JIRA_USER_EMAIL  = 'Thanhhh1005@gmail.com'
        JIRA_API_TOKEN   = credentials('jira-api-token')
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                echo '=== Tải mã nguồn mới nhất ==='
                cleanWs()
                checkout scm

                // ===== [TEST JIRA] Lỗi giả để test tự động tạo Jira issue =====
                powershell '''
                    Write-Host "Gia lap loi de test Jira integration..."
                    Write-Host "ERROR: Khong tim thay file cau hinh quan trong!"
                    exit 1
                '''
                // ===== [TEST JIRA] Xoa 5 dong tren sau khi test xong =====
            }
        }

        stage('2. Restore & Build Backend') {
            steps {
                echo '=== Restore & Build .NET Backend ==='

                powershell '''
                    dotnet restore HomeDecorShop/HomeDecorShop.sln --force
                    if ($LASTEXITCODE -ne 0) { exit 1 }

                    dotnet build HomeDecorShop/HomeDecorShop.sln `
                        --configuration Release
                    if ($LASTEXITCODE -ne 0) { exit 1 }
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
                    & "C:\\Users\\thanh\\AppData\\Roaming\\npm\\newman.cmd" run `
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

            script {
                echo '=== TẠO JIRA ISSUE TỰ ĐỘNG ==='

                // Round-robin 4 thành viên
                def teamMembers = [
                    '712020:5a3019aa-6d3f-409f-83bc-f7b620c2d93c',
                    '712020:3c276ba2-59aa-4d18-b629-708badf63148',
                    '712020:13aa95c8-c131-4b20-af19-2334569cfa55',
                    '712020:0f0e1f4b-2bb3-4a9d-a90e-597b8d90f701'
                ]
                def idx        = env.BUILD_NUMBER.toInteger() % teamMembers.size()
                def assigneeId = teamMembers[idx]

                def jiraUrl    = env.JIRA_BASE_URL
                def jiraKey    = env.JIRA_PROJECT_KEY
                def jiraEmail  = env.JIRA_USER_EMAIL
                def jiraToken  = env.JIRA_API_TOKEN
                def buildNum   = env.BUILD_NUMBER
                def buildUrl   = env.BUILD_URL ?: 'N/A'

                // JSON body một dòng (tránh lỗi here-string trong Groovy)
                def jsonBody = """{"fields":{"project":{"key":"${jiraKey}"},"summary":"[Jenkins] Build #${buildNum} FAILED","description":{"version":1,"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Project: HomeDecorShop | Build: #${buildNum} | URL: ${buildUrl} | Assignee index: ${idx}"}]}]},"issuetype":{"name":"Bug"},"assignee":{"accountId":"${assigneeId}"},"priority":{"name":"High"},"labels":["auto-jenkins","ci-cd"]}}"""

                powershell """
                    \$creds   = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes('${jiraEmail}:${jiraToken}'))
                    \$headers = @{ 'Authorization' = "Basic \$creds" }
                    \$bodyBytes = [Text.Encoding]::UTF8.GetBytes('${jsonBody.replace("'", "''")}')

                    try {
                        \$res = Invoke-RestMethod -Uri '${jiraUrl}/rest/api/3/issue' -Method POST -Headers \$headers -Body \$bodyBytes -ContentType 'application/json'
                        Write-Host "=== JIRA ISSUE CREATED: \$(\$res.key) ==="
                        Write-Host "Link: ${jiraUrl}/browse/\$(\$res.key)"
                    } catch {
                        Write-Host "=== FAILED to create Jira issue ==="
                        Write-Host \$_.Exception.Message
                        Write-Host \$_.ErrorDetails.Message
                    }
                """
            }
        }
    }
}