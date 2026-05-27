pipeline {
    agent any

    environment {
        // ==================== CẤU HÌNH KẾT NỐI JIRA ====================
        JIRA_DOMAIN = 'nguyenhathanh844.atlassian.net'   // Tên miền Jira Cloud của bạn (ví dụ: abc.atlassian.net)
        JIRA_EMAIL = 'nguyenhathanh844@gmail.com'       // Email tài khoản đăng nhập Jira của bạn
        
        // ID Credentials lưu trữ API Token trong Jenkins (Cần tạo Secret Text trong Jenkins Credentials)
        JIRA_TOKEN_CREDENTIAL_ID = 'jira-api-token' 
        
        // ID Transition trên Jira để chuyển trạng thái Ticket (xem hướng dẫn lấy ID bên dưới)
        JIRA_TRANSITION_SUCCESS_ID = '31'           // ID khi thành công (ví dụ: chuyển sang Ready for Testing / Done)
        JIRA_TRANSITION_FAILURE_ID = '21'           // ID khi thất bại (ví dụ: chuyển sang Reopened / To Do)
        
        PORT = "5020"
        BACKEND_URL = "http://localhost:5020"
    }

    stages {
        // 1. Tải mã nguồn mới nhất từ kho lưu trữ Git
        stage('Tải Mã Nguồn') {
            steps {
                checkout scm
            }
        }

        // 2. Chạy toàn bộ 94 ca C# Unit Tests bằng xUnit
        stage('Chạy Unit Test C#') {
            steps {
                powershell 'dotnet test HomeDecorShop/HomeDecorShop.sln --configuration Release'
            }
        }

        // 3. Khởi chạy ngầm ứng dụng Backend API trên Windows
        stage('Khởi Chạy Backend API') {
            steps {
                powershell '''
                    # Tắt các tiến trình chạy ngầm cũ trên cổng 5020 nếu có
                    $processes = Get-NetTCPConnection -LocalPort 5020 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
                    foreach ($procId in $processes) {
                        if ($procId) {
                            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                            Write-Host "Đã dọn dẹp tiến trình cũ chiếm cổng 5020 (PID: $procId)."
                        }
                    }
                    
                    # Khởi chạy Backend ngầm
                    Start-Process dotnet -ArgumentList "run --project HomeDecorShop/HomeDecorShop.API/HomeDecorShop.API.csproj --launch-profile http" -WindowStyle Hidden
                    Write-Host "Đang khởi chạy Backend API ở chế độ chạy ngầm trên Windows..."
                '''
            }
        }

        // 4. Polling kiểm thử kết nối cổng 5020 đảm bảo Backend đã sẵn sàng nhận request
        stage('Đợi Server Sẵn Sàng') {
            steps {
                powershell '''
                    $maxRetries = 15
                    $retryCount = 0
                    $portActive = $false
                    
                    while (-not $portActive -and $retryCount -lt $maxRetries) {
                        try {
                            $client = New-Object System.Net.Sockets.TcpClient
                            $client.Connect("localhost", 5020)
                            $portActive = $true
                            $client.Close()
                            Write-Host "Backend API đã khởi động thành công trên cổng 5020!"
                        } catch {
                            $retryCount++
                            Write-Host "Đang đợi Backend sẵn sàng... (Lần thử $retryCount/$maxRetries)"
                            Start-Sleep -Seconds 2
                        }
                    }
                    if (-not $portActive) {
                        throw "Không thể kết nối đến Backend API trên cổng 5020 sau $maxRetries lần thử!"
                    }
                '''
            }
        }

        // 5. Chốt chặn API Integration Test: Chạy Newman kiểm thử 10 requests và 14 assertions
        stage('Kiểm Thử API Tự Động (Newman)') {
            steps {
                powershell "newman run HomeDecorShop/HomeDecorShop_Postman.json --env-var 'url=${BACKEND_URL}'"
            }
        }
    }

    post {
        always {
            // Luôn dọn dẹp và tắt tiến trình Backend ngầm để giải phóng port 5020 cho lần build tiếp theo
            powershell '''
                Write-Host "Đang giải phóng cổng 5020..."
                $processes = Get-NetTCPConnection -LocalPort 5020 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
                foreach ($procId in $processes) {
                    if ($procId) {
                        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                        Write-Host "Đã tắt tiến trình Backend ngầm (PID: $procId) thành công."
                    }
                }
            '''
        }
        
        success {
            echo "Chúc mừng! Toàn bộ hệ thống kiểm thử XANH. Dự án HomeDecorShop hoạt động hoàn hảo."
            
            // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI JIRA KHI BUILD THÀNH CÔNG (Dùng Credentials bảo mật)
            withCredentials([string(credentialsId: "${env.JIRA_TOKEN_CREDENTIAL_ID}", variable: 'JIRA_API_TOKEN')]) {
                powershell """
                    $commitMsg = git log -1 --pretty=%B
                    Write-Host "Commit message gần nhất: \$commitMsg"
                    
                    # Regex trích xuất mã Ticket Jira dạng PROJECT-123
                    if (\$commitMsg -match '([A-Z]+-\\d+)') {
                        \$issueKey = \$Matches[1]
                        Write-Host "Tìm thấy mã Ticket Jira: \$issueKey. Tiến hành cập trạng thái thành công..."
                        
                        \$authHeader = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${env.JIRA_EMAIL}:\$JIRA_API_TOKEN"))
                        \$headers = @{
                            "Authorization" = "Basic \$authHeader"
                            "Content-Type" = "application/json"
                        }
                        
                        \$body = @{
                            "transition" = @{
                                "id" = "${env.JIRA_TRANSITION_SUCCESS_ID}"
                            }
                        } | ConvertTo-Json
                        
                        \$uri = "https://${env.JIRA_DOMAIN}/rest/api/3/issue/\$issueKey/transitions"
                        try {
                            Invoke-RestMethod -Uri \$uri -Method Post -Headers \$headers -Body \$body
                            Write-Host "Đã cập nhật trạng thái Ticket \$issueKey trên Jira thành công (Mã Transition: ${env.JIRA_TRANSITION_SUCCESS_ID})!"
                        } catch {
                            Write-Warning "Lỗi khi cập nhật trạng thái trên Jira: \$\_"
                        }
                    } else {
                        Write-Host "Không tìm thấy mã Ticket Jira trong commit message. Bỏ qua cập nhật Jira."
                    }
                """
            }
        }
        
        failure {
            echo "Hệ thống có lỗi ĐỎ! Vui lòng kiểm tra lại log của xUnit hoặc Newman."
            
            // TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI JIRA VỀ THẤT BẠI (REOPENED/TO DO)
            withCredentials([string(credentialsId: "${env.JIRA_TOKEN_CREDENTIAL_ID}", variable: 'JIRA_API_TOKEN')]) {
                powershell """
                    $commitMsg = git log -1 --pretty=%B
                    if (\$commitMsg -match '([A-Z]+-\\d+)') {
                        \$issueKey = \$Matches[1]
                        Write-Host "Tìm thấy mã Ticket Jira: \$issueKey. Tiến hành chuyển đổi trạng thái về Thất bại..."
                        
                        \$authHeader = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${env.JIRA_EMAIL}:\$JIRA_API_TOKEN"))
                        \$headers = @{
                            "Authorization" = "Basic \$authHeader"
                            "Content-Type" = "application/json"
                        }
                        
                        \$body = @{
                            "transition" = @{
                                "id" = "${env.JIRA_TRANSITION_FAILURE_ID}"
                            }
                        } | ConvertTo-Json
                        
                        \$uri = "https://${env.JIRA_DOMAIN}/rest/api/3/issue/\$issueKey/transitions"
                        try {
                            Invoke-RestMethod -Uri \$uri -Method Post -Headers \$headers -Body \$body
                            Write-Host "Đã chuyển đổi trạng thái Ticket \$issueKey trên Jira về Thất bại (Mã Transition: ${env.JIRA_TRANSITION_FAILURE_ID})!"
                        } catch {
                            Write-Warning "Lỗi khi cập nhật trạng thái trên Jira: \$\_"
                        }
                    }
                """
            }
        }
    }
}
