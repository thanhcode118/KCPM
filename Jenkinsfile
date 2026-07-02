pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        DOTNET_CLI_HOME = "${WORKSPACE}\\.dotnet"
        API_URL = "http://localhost:5020"
        NEWMAN_CMD = "C:\\Users\\admin\\AppData\\Roaming\\npm\\newman.cmd"

        // ===== JIRA INTEGRATION =====
        JIRA_BASE_URL    = 'https://nguyenhathanh844.atlassian.net'
        JIRA_PROJECT_KEY = 'HOM'
        JIRA_USER_EMAIL  = credentials('jira-user-email')
        JIRA_API_TOKEN   = credentials('jira-api-token')
    }

    stages {

        stage('1. Checkout Code') {
            steps {
                echo '=== Tải mã nguồn mới nhất ==='
                cleanWs()
                checkout scm

                // // ===== [TEST JIRA] Lỗi giả để test tự động tạo Jira issue =====
                // powershell '''
                //     $errorMsg = "ERROR: [Lỗi ảo test Jira] Khong tim thay file cau hinh appsettings.json quan trong! Thu muc HomeDecorShop/HomeDecorShop.API khong ton tai file can thiet."
                //     Write-Host $errorMsg
                //     $errorMsg | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                //     exit 1
                // '''
                // // ===== [TEST JIRA] Xoa đoạn trên sau khi test xong =====
            }
        }

        stage('2. Restore & Build Backend') {
            steps {
                echo '=== Restore & Build .NET Backend ==='

                powershell '''
                    $ErrorActionPreference = "Stop"
                    try {
                        dotnet restore HomeDecorShop/HomeDecorShop.sln --force
                        if ($LASTEXITCODE -ne 0) { throw "dotnet restore that bai voi exit code $LASTEXITCODE" }

                        dotnet build HomeDecorShop/HomeDecorShop.sln --configuration Release
                        if ($LASTEXITCODE -ne 0) { throw "dotnet build that bai voi exit code $LASTEXITCODE" }
                    } catch {
                        $_ | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                        exit 1
                    }
                '''
            }
        }

        stage('3. Run C# Unit Tests') {
            steps {
                echo '=== Chạy Unit Test xUnit ==='

                powershell '''
                    $ErrorActionPreference = "Stop"
                    try {
                        dotnet test HomeDecorShop/HomeDecorShop.Tests/HomeDecorShop.Tests.csproj `
                            --configuration Release `
                            --logger "trx;LogFileName=unittest-results.trx" `
                            /p:CollectCoverage=true `
                            /p:CoverletOutputFormat=cobertura `
                            /p:CoverletOutput=./TestResults/
                        if ($LASTEXITCODE -ne 0) { throw "Unit test that bai: $LASTEXITCODE test(s) failed. Xem chi tiet trong file unittest-results.trx" }
                    } catch {
                        $_ | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                        exit 1
                    }
                '''
            }

            post {
                always {
                    echo '=== Lưu kết quả Unit Test ==='
                    archiveArtifacts artifacts: '**/TestResults/*.trx', allowEmptyArchive: true
                    archiveArtifacts artifacts: '**/TestResults/*.xml', allowEmptyArchive: true
                    script {
                        try {
                            // Tạm thời comment publishCoverage vì thiếu plugin Cobertura trên Jenkins gây ra lỗi NoSuchMethodError
                            // publishCoverage adapters: [coberturaAdapter('**/TestResults/coverage.cobertura.xml')]
                            echo "Đã bỏ qua bước publishCoverage do thiếu plugin."
                        } catch (Throwable t) {
                            echo "WARNING: Khong the publish coverage. Co the thieu Coverage Plugin. Chi tiet: ${t.message}"
                        }
                    }
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
                        } catch {
                            Write-Host "API chua san sang... retry $i"
                            Start-Sleep -Seconds 2
                        }
                    }
                    if (-not $ready) {
                        $msg = "API startup that bai sau 60 giay. Backend khong khoi dong duoc tai http://localhost:5020"
                        Write-Host $msg
                        $msg | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                        exit 1
                    }
                    Write-Host "API da san sang"
                '''

                echo '=== Seed dữ liệu ==='
                powershell '''
                    try {
                        $response = Invoke-RestMethod -Method Post -Uri http://localhost:5020/api/Maintenance/seed/all
                        Write-Host "Seed thanh cong"
                        Write-Host $response
                    } catch {
                        $msg = "Seed du lieu that bai: $_"
                        Write-Host $msg
                        $msg | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                        exit 1
                    }
                '''
            }
        }

        stage('5. Start Frontend') {
    steps {
        echo '=== Khởi động Frontend ==='

        powershell '''
            $ErrorActionPreference = "Stop"

            try {
                cd frontend

                npm install

                Start-Process `
                    -FilePath "cmd.exe" `
                    -ArgumentList "/c npm run dev -- --host 0.0.0.0 --port 3000" `
                    -WindowStyle Hidden

                Write-Host "Dang cho Frontend khoi dong..."

                $ready = $false
                for ($i = 0; $i -lt 30; $i++) {
                    try {
                        Invoke-WebRequest http://localhost:3000 -UseBasicParsing
                        $ready = $true
                        break
                    } catch {
                        Write-Host "Frontend chua san sang... retry $i"
                        Start-Sleep -Seconds 2
                    }
                }

                if (-not $ready) {
                    $msg = "Frontend startup that bai sau 60 giay. Frontend khong khoi dong duoc tai http://localhost:3000"
                    Write-Host $msg
                    $msg | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                    exit 1
                }

                Write-Host "Frontend da san sang tai http://localhost:3000"
            }
            catch {
                $_ | Out-File -FilePath "../jenkins-error.txt" -Encoding utf8
                exit 1
            }
        '''
    }
}

stage('6. Run CodeceptJS Tests') {
    steps {
        echo '=== Chạy CodeceptJS FE + API Tests ==='

        powershell '''
            $ErrorActionPreference = "Stop"

            try {
                cd codecept-tests

                npm install

                $env:FE_URL = "http://localhost:3000"
                $env:API_URL = "http://localhost:5020"

                npx playwright install chromium

                Write-Host "=== Chay Product Filter Test ==="
                npx codeceptjs run tests/fe/product_filter_test.js
                if ($LASTEXITCODE -ne 0) {
                    throw "CodeceptJS Product Filter test that bai voi exit code $LASTEXITCODE"
                }

                Write-Host "=== Chay Product Detail Bug Test ==="
                npx codeceptjs run tests/fe/product_detail_bug_test.js
                if ($LASTEXITCODE -ne 0) {
                    throw "CodeceptJS Product Detail Bug test that bai voi exit code $LASTEXITCODE"
                }

                Write-Host "=== CodeceptJS tests hoan thanh ==="
            }
            catch {
                $_ | Out-File -FilePath "../jenkins-error.txt" -Encoding utf8
                exit 1
            }
        '''
    }
}

        stage('7. Run Newman API Tests') {
            steps {

                echo '=== Tạo thư mục report ==='
                powershell '''
                    New-Item -ItemType Directory -Force -Path newman-results
                '''

                echo '=== Chạy Newman ==='
                powershell '''
                    $ErrorActionPreference = "Stop"
                    try {
                        & "C:\\Users\\admin\\AppData\\Roaming\\npm\\newman.cmd" run `
                            HomeDecorShop/HomeDecorShop_Postman.json `
                            --env-var "url=http://localhost:5020" `
                            --reporters cli,junit,html `
                            --reporter-junit-export newman-results/newman-report.xml `
                            --reporter-html-export newman-results/newman-report.html
                        if ($LASTEXITCODE -ne 0) { throw "Newman API test that bai: $LASTEXITCODE request(s) failed. Xem bao cao tai newman-results/newman-report.html" }
                    } catch {
                        $_ | Out-File -FilePath "jenkins-error.txt" -Encoding utf8
                        exit 1
                    }
                '''
            }

            post {
                always {
                    echo '=== Publish Newman Reports ==='
                    script {
                        try {
                            junit 'newman-results/newman-report.xml'
                        } catch (Exception e) {
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
                        } catch (Exception e) {
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
                Stop-Process -Name node -Force -ErrorAction SilentlyContinue
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

                // ---- Map email Git → Jira Account ID (ai push code lỗi thì nhận bug) ----
                def emailToJiraId = [
                    'thanhhh1005@gmail.com'   : '712020:5a3019aa-6d3f-409f-83bc-f7b620c2d93c',  // Nguyễn Hà Thanh
                    'ngoctoan24042005@gmail.com' : '712020:3c276ba2-59aa-4d18-b629-708badf63148',  // NguyenNgocToan - SỬA EMAIL NÀY
                    'nguyenhathanh844@gmail.com'        : '712020:13aa95c8-c131-4b20-af19-2334569cfa55',  // Thanh Lê - SỬA EMAIL NÀY
                    '123tiepnguyenthanh@gmail.com'     : '712020:0f0e1f4b-2bb3-4a9d-a90e-597b8d90f701'  // Tiếp Nguyễn Thành - SỬA EMAIL NÀY
                ]
                // ---- Lấy email người TRIGGER build (bấm Build Now hoặc push code) ----
                def triggerEmail = ''
                try {
                    wrap([$class: 'BuildUser']) {
                        triggerEmail = env.BUILD_USER_EMAIL ?: ''
                    }
                } catch (Exception e) {
                    // Fallback: dùng git author nếu plugin chưa cài
                    triggerEmail = env.GIT_AUTHOR_EMAIL ?: ''
                }
                echo "=== Triggered by: ${triggerEmail} ==="

                def teamIds    = emailToJiraId.values().toList()
                def assigneeId = emailToJiraId.containsKey(triggerEmail)
                                    ? emailToJiraId[triggerEmail]
                                    : teamIds[env.BUILD_NUMBER.toInteger() % teamIds.size()]

                // ---- Đọc nội dung lỗi từ file do stage ghi ra ----
                def errorContent = 'Khong ro nguyen nhan loi. Xem Console Output tren Jenkins.'
                try {
                    errorContent = readFile('jenkins-error.txt').trim()
                } catch (Exception e) {
                    errorContent = "Khong doc duoc file loi: ${e.message}"
                }

                // ---- Cắt ngắn nếu quá dài ----
                if (errorContent.length() > 800) {
                    errorContent = errorContent.substring(0, 800) + '...(xem them tren Jenkins)'
                }

                // ---- Escape ký tự đặc biệt trong JSON ----
                def safeError = errorContent
                    .replace('\\', '\\\\')
                    .replace('"', '\\"')
                    .replace('\n', '\\n')
                    .replace('\r', '')
                    .replace('\t', ' ')

                // Metadata
                def jiraUrl   = env.JIRA_BASE_URL
                def jiraKey   = env.JIRA_PROJECT_KEY
                def jiraEmail = env.JIRA_USER_EMAIL
                def jiraToken = env.JIRA_API_TOKEN
                def buildNum  = env.BUILD_NUMBER
                def buildUrl  = env.BUILD_URL ?: 'N/A'

                // ---- Tạo JSON body với nội dung lỗi đầy đủ ----
                def jsonBody = """{"fields":{"project":{"key":"${jiraKey}"},"summary":"[Jenkins] Build #${buildNum} FAILED","description":{"version":1,"type":"doc","content":[{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Noi dung loi"}]},{"type":"codeBlock","content":[{"type":"text","text":"${safeError}"}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Mo ta"}]},{"type":"paragraph","content":[{"type":"text","text":"Build #${buildNum} tren Jenkins that bai."},{"type":"hardBreak"},{"type":"text","text":"Link xem chi tiet: ${buildUrl}"}]}]},"issuetype":{"name":"Bug"},"assignee":{"accountId":"${assigneeId}"},"priority":{"name":"High"},"labels":["auto-jenkins","ci-cd"]}}"""

                // ---- Ghi JSON ra file để tránh lỗi escape nhiều lớp ----
                writeFile file: 'jira-payload.json', text: jsonBody

                // ---- Dùng withCredentials + single-quote PS: token KHÔNG bị mask thành **** ----
                withCredentials([string(credentialsId: 'jira-api-token', variable: 'JIRA_TOKEN_SECRET')]) {
                    powershell '''
                        $token   = $env:JIRA_TOKEN_SECRET
                        $email   = $env:JIRA_USER_EMAIL
                        $jiraUrl = $env:JIRA_BASE_URL

                        $creds     = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${email}:${token}"))
                        $headers   = @{ Authorization = "Basic $creds"; "Content-Type" = "application/json" }
                        $bodyBytes = [System.IO.File]::ReadAllBytes((Resolve-Path "jira-payload.json").Path)

                        Write-Host "=== Dang tao Jira issue... ==="
                        try {
                            $res = Invoke-RestMethod -Uri "$jiraUrl/rest/api/3/issue" -Method POST -Headers $headers -Body $bodyBytes -ContentType "application/json"
                            Write-Host "=== JIRA ISSUE CREATED: $($res.key) ==="
                            Write-Host "=== Link: $jiraUrl/browse/$($res.key) ==="
                        } catch {
                            Write-Host "=== FAILED to create Jira issue ==="
                            Write-Host "HTTP Status: $($_.Exception.Response.StatusCode.value__)"
                            Write-Host "Error: $($_.Exception.Message)"
                            try {
                                $stream = $_.Exception.Response.GetResponseStream()
                                $reader = New-Object System.IO.StreamReader($stream)
                                $reader.BaseStream.Position = 0
                                Write-Host "Jira says: $($reader.ReadToEnd())"
                            } catch {}
                        }
                    '''
                }
            }
        }
    }
}