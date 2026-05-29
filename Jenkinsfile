pipeline {
    agent any

    environment {
        // Cấu hình các biến môi trường
        DOTNET_CLI_HOME = "${WORKSPACE}\\.dotnet"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo '=== Tải mã nguồn mới nhất từ kho lưu trữ ==='
                cleanWs()
                checkout scm
            }
        }

        stage('2. Restore & Build Backend') {
            steps {
                echo '=== Khôi phục các gói NuGet và Biên dịch ứng dụng Backend ==='
                powershell 'dotnet restore HomeDecorShop/HomeDecorShop.sln'
                powershell 'dotnet build HomeDecorShop/HomeDecorShop.sln --configuration Release'
            }
        }

        stage('3. Run C# Unit Tests') {
            steps {
                echo '=== Khởi chạy bộ Unit Test xUnit ==='
                // Chạy dotnet test và thu thập báo cáo kết quả kiểm thử (.trx)
                powershell '''
                    dotnet test HomeDecorShop/HomeDecorShop.Tests/HomeDecorShop.Tests.csproj `
                        --configuration Release `
                        --logger "trx;LogFileName=unittest-results.trx" `
                        --collect:"XPlat Code Coverage"
                '''
            }
            post {
                always {
                    echo '=== Lưu trữ kết quả Unit Test ==='
                    // Lưu trữ file TRX thô làm Artifact để tải về xem, không lo lỗi thiếu plugin
                    archiveArtifacts artifacts: '**/TestResults/*.trx', allowEmptyArchive: true
                }
            }
        }

        stage('4. Start DB & Backend') {
            steps {
                echo '=== Khởi động SQL Server Container ==='
                // Xóa cứng bất kỳ container nào có tên 'beeshop-sql' đang chạy trên hệ thống để tránh xung đột giữa các Workspace (@2, @3...)
                powershell 'docker rm -f beeshop-sql'
                powershell 'docker compose -f docker-compose.sql.yml down'
                powershell 'docker compose -f docker-compose.sql.yml up -d'

                echo '=== Khởi chạy Backend Service ngầm (Port 5020) ==='
                // Tắt các tiến trình dotnet cũ chạy ngầm (nếu có) để giải phóng cổng 5020
                powershell 'Stop-Process -Name dotnet -Force -ErrorAction SilentlyContinue'
                
                // Khởi chạy ứng dụng Web API dưới nền bằng lệnh 'start' của cmd để tách biệt hoàn toàn tiến trình khỏi Jenkins (tránh bị treo)
                powershell '''
                    cmd /c "start /min dotnet run --project HomeDecorShop/HomeDecorShop.API/HomeDecorShop.API.csproj --urls http://localhost:5020"
                    echo "Backend API dang duoc khoi chay ngam. Cho 15s de he thong san sang..."
                    Start-Sleep -Seconds 15
                '''
                
                echo '=== Seed dữ liệu mẫu vào cơ sở dữ liệu ==='
                // Tự động seed dữ liệu mẫu để phục vụ cho các bài test Newman
                powershell '''
                    try {
                        $response = Invoke-RestMethod -Method Post http://localhost:5020/api/Maintenance/seed/all
                        echo "Seed du lieu thanh cong: $response"
                    } catch {
                        echo "Loi khi seed du lieu: $_"
                        exit 1
                    }
                '''
            }
        }

        stage('5. Run Newman API Tests') {
            steps {
                echo '=== Khởi chạy kiểm thử tự động API bằng Newman ==='
                // Tạo thư mục lưu kết quả test của Newman
                powershell 'New-Item -ItemType Directory -Force -Path newman-results'
                
                // Chạy bộ sưu tập Postman, sinh báo cáo định dạng JUnit (XML) và HTML đẹp mắt
                powershell '''
                    newman run HomeDecorShop/HomeDecorShop_Postman.json `
                        --env-var "url=http://localhost:5020" `
                        --reporters cli,junit,html `
                        --reporter-junit-export newman-results/newman-report.xml `
                        --reporter-html-export newman-results/newman-report.html
                '''
            }
            post {
                always {
                    echo '=== Xuất báo cáo kết quả Newman API Test ==='
                    script {
                        try {
                            // Xuất đồ thị kiểm thử API lên Jenkins
                            junit 'newman-results/newman-report.xml'
                        } catch (Exception e) {
                            echo "WARNING: Khong the hien thi do thi Newman vi thieu plugin 'JUnit'."
                        }

                        try {
                            // Lưu trữ trang HTML báo cáo kết quả API
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'newman-results',
                                reportFiles: 'newman-report.html',
                                reportName: 'Newman API Integration Report',
                                reportTitles: 'Newman API Integration Test Report'
                            ])
                        } catch (Exception e) {
                            echo "WARNING: Khong the hien thi bao cao HTML Newman vi thieu plugin 'HTML Publisher'. Vui long vao http://localhost:8080/pluginManager/available de cai dat."
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo '=== Dọn dẹp tài nguyên và các tiến trình nền ==='
            // Đảm bảo tắt tiến trình dotnet chạy ngầm để giải phóng cổng 5020 cho build tiếp theo
            powershell 'Stop-Process -Name dotnet -Force -ErrorAction SilentlyContinue'
            
            // Dừng database container và xóa cứng để tránh xung đột
            powershell 'docker compose -f docker-compose.sql.yml down'
            powershell 'docker rm -f beeshop-sql'
        }
        success {
            echo '=== BẢN BUILD VÀ CÁC BÀI TEST ĐỀU THÀNH CÔNG! 🎉 ==='
        }
        failure {
            echo '=== BẢN BUILD HOẶC KỂM THỬ THẤT BẠI. VUI LÒNG KIỂM TRA LẠI LOGS! ❌ ==='
        }
    }
}
