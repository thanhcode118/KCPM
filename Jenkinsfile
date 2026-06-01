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
        JIRA_API_TOKEN   = credentials('jira-api-token')      // Lưu trong Jenkins Credentials
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

                // --- Round-robin: Danh sách Account ID của 4 thành viên ---
                // TODO: Thay bằng Account ID thật của team (xem hướng dẫn bên dưới)
                def teamMembers = [
                    '712020:5a3019aa-6d3f-409f-83bc-f7b620c2d93c',   // Nguyễn Hà Thanh
                    '712020:3c276ba2-59aa-4d18-b629-708badf63148',   // NguyenNgocToan
                    '712020:13aa95c8-c131-4b20-af19-2334569cfa55',   // Thanh Lê
                    '712020:0f0e1f4b-2bb3-4a9d-a90e-597b8d90f701'   // Tiếp Nguyễn Thành
                ]
                def assigneeIndex = env.BUILD_NUMBER.toInteger() % teamMembers.size()
                def assigneeId = teamMembers[assigneeIndex]

                // --- Thu thập thông tin lỗi ---
                def failedStageName = 'Unknown'
                def buildLog = ''
                try {
                    def logLines = currentBuild.rawBuild.getLog(80)
                    buildLog = logLines.join('\n')

                    // Tìm stage thất bại từ log
                    for (line in logLines.reverse()) {
                        def m = (line =~ /Stage '([^']+)'/)
                        if (m.find()) {
                            failedStageName = m.group(1)
                            break
                        }
                    }
                } catch (Exception e) {
                    buildLog = "Khong the doc build log: ${e.message}"
                }

                // --- Cắt log nếu quá dài (Jira giới hạn ký tự) ---
                if (buildLog.length() > 5000) {
                    buildLog = buildLog.substring(buildLog.length() - 5000)
                }

                // --- Escape ký tự đặc biệt cho JSON ---
                def safeLog = buildLog
                    .replace('\\', '\\\\')
                    .replace('"', '\\"')
                    .replace('\n', '\\n')
                    .replace('\r', '')
                    .replace('\t', '    ')

                def issueSummary = "[Jenkins] Build #${env.BUILD_NUMBER} FAILED - ${failedStageName}"
                def issueDesc = "*Project*: HomeDecorShop\\n*Build*: #${env.BUILD_NUMBER}\\n*Stage that bai*: ${failedStageName}\\n*Build URL*: ${env.BUILD_URL}\\n\\n*Chi tiet loi:*\\n{code}\\n${safeLog}\\n{code}"

                // --- Gọi Jira REST API tạo Bug ---
                powershell """
                    \$headers = @{
                        'Authorization' = 'Basic ' + [Convert]::ToBase64String(
                            [Text.Encoding]::ASCII.GetBytes('${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}')
                        )
                        'Content-Type' = 'application/json; charset=utf-8'
                    }

                    \$body = @"
{
    "fields": {
        "project": { "key": "${JIRA_PROJECT_KEY}" },
        "summary": "${issueSummary}",
        "description": {
            "version": 1,
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": "${issueDesc}"
                        }
                    ]
                }
            ]
        },
        "issuetype": { "name": "Bug" },
        "assignee": { "accountId": "${assigneeId}" },
        "priority": { "name": "High" },
        "labels": ["auto-jenkins", "ci-cd"]
    }
}
"@

                    try {
                        \$response = Invoke-RestMethod ``
                            -Uri '${JIRA_BASE_URL}/rest/api/3/issue' ``
                            -Method POST ``
                            -Headers \$headers ``
                            -Body ([System.Text.Encoding]::UTF8.GetBytes(\$body)) ``
                            -ContentType 'application/json; charset=utf-8'

                        Write-Host "JIRA ISSUE CREATED: \$(\$response.key)"
                        Write-Host "Link: ${JIRA_BASE_URL}/browse/\$(\$response.key)"
                        Write-Host "Assigned to member index: ${assigneeIndex}"
                    }
                    catch {
                        Write-Host "FAILED to create Jira issue"
                        Write-Host \$_.Exception.Message
                        Write-Host \$_.ErrorDetails.Message
                    }
                """
            }
        }
    }
}