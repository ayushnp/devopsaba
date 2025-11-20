pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "ayushdocker/cicd-demo"
        DOCKER_CREDENTIALS = "dockerhub"
    }

    stages {
        stage('Clone Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/<username>/ci-cd-demo-app.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDENTIALS) {
                        sh "docker push $DOCKER_IMAGE"
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    sh "docker rm -f cicd-app || true"
                    sh "docker run -d -p 5000:5000 --name cicd-app $DOCKER_IMAGE"
                }
            }
        }
    }
}
