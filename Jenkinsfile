pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "homedecorshop-api:latest"
        CONTAINER_NAME = "homedecorshop-running-app"
    }

    stages {
        // 1. Tai ma nguon moi nhat tu GitHub ve may chu Jenkins
        stage('Tải Mã Nguồn') {
            steps {
                checkout scm
            }
        }

        // 2. Chot chan Unit Test: Goi xUnit.net de kiem tra logic nghiep vu C#
        stage('Chạy Unit Test C#') {
            steps {
                dir('HomeDecorShop') {
                    sh 'dotnet test HomeDecorShop.sln --configuration Release'
                }
            }
        }

        // 3. Neu Unit Test vuot qua thanh cong, tien hanh build Docker Image
        stage('Đóng Gói Docker') {
            steps {
                dir('HomeDecorShop') {
                    sh "docker build -t ${DOCKER_IMAGE} ."
                }
            }
        }

        // 4. Khoi chay Container tren Server test tai cong 5000
        stage('Triển Khai Server (Deploy)') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm ${CONTAINER_NAME} || true"
                sh "docker run -d -p 5000:80 --name ${CONTAINER_NAME} ${DOCKER_IMAGE}"
            }
        }

        // 5. Chot chan Integration Test: Chay Newman ban test API va kiem tra ket qua
        stage('Kiểm Thử API Tự Động (Newman)') {
            steps {
                // Cho phep container 5 giay de khoi chay va san sang ket noi DB
                sleep 5
                dir('HomeDecorShop') {
                    sh "newman run HomeDecorShop_Postman.json --env-var 'url=http://localhost:5000'"
                }
            }
        }
    }

    // Xu ly sau khi hoan thanh cac buoc
    post {
        success {
            echo "Chúc mừng! Toàn bộ hệ thống XANH. Dự án HomeDecorShop hoạt động hoàn hảo."
        }
        failure {
            echo "Hệ thống có lỗi ĐỎ! Vui lòng kiểm tra lại log của xUnit hoặc Newman."
        }
    }
}
