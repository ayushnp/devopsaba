pipeline {
    agent any

    environment {
        DOCKERHUB_USER = credentials('dockerhub-user')   // Jenkins Credentials ID
        DOCKERHUB_PASS = credentials('dockerhub-pass')   // Jenkins Credentials ID
        IMAGE_NAME = "ayushnp/devopsaba"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git url: 'https://github.com/ayushnp/devopsaba.git', branch: 'main'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                docker build -t %IMAGE_NAME% .
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                bat """
                echo %DOCKERHUB_PASS% | docker login -u %DOCKERHUB_USER% --password-stdin
                """
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                bat """
                docker push %IMAGE_NAME%
                """
            }
        }

        stage('Deploy Container') {
            steps {
                bat """
                docker stop devopsaba || exit 0
                docker rm devopsaba || exit 0
                docker run -d --name devopsaba -p 8080:8080 %IMAGE_NAME%
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Build Failed!'
        }
    }
}
