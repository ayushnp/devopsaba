pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ayushnp/devopsaba.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                    echo Building Docker Image...
                    docker build -t %IMAGE% .
                """
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER', passwordVariable: 'PASS')]) {

                    bat """
                        echo %PASS% | docker login -u %USER% --password-stdin
                    """
                }
            }
        }

        stage('Push Image to Docker Hub') {
            steps {
                bat """
                    docker push %IMAGE%
                """
            }
        }

        stage('Deploy Container') {
            steps {
                bat """
                    echo Stopping old container...
                    docker stop devopsaba || echo "No container to stop"

                    echo Removing old container...
                    docker rm devopsaba || echo "No container to remove"

                    echo Running new updated container...
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }
    }

    post {
        success {
            echo "CI/CD Pipeline Completed Successfully!"
            slackSend(channel: '#ci-cd-pipeline', message: 'Build Success!')
        }
        failure {
            echo "Pipeline Failed!"
            slackSend(channel: '#ci-cd-pipeline', message: 'Build Failed!')
        }
    }
}
