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

            // Slack Notification (SUCCESS)
            slackSend(
                webhookUrl: credentials('slack-webhook'),
                channel: '#ci-cd-pipeline',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email Notification
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Status: SUCCESS

View build details:
${env.BUILD_URL}

Regards,
Jenkins
""",
                attachLog: true
            )
        }

        failure {
            echo "Pipeline Failed!"

            // Slack Notification (FAILURE)
            slackSend(
                webhookUrl: credentials('slack-webhook'),
                channel: '#ci-cd-pipeline',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email Notification
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline has FAILED.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Status: FAILURE

Console logs:
${env.BUILD_URL}console

Regards,
Jenkins
""",
                attachLog: true
            )
        }
    }
}
