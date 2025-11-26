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

        /* ----------------------------------------------------
           SECRET LEAKAGE SCAN (FAIL IF ANY SECRETS FOUND)
        ---------------------------------------------------- */
        stage('Secret Scan (Gitleaks)') {
            steps {
                bat """
                    echo Running Gitleaks Secret Scan...
                    docker run --rm ^
                        -v %CD%:/repo ^
                        zricethezav/gitleaks:latest detect ^
                        --source=/repo ^
                        --exit-code 1 ^
                        --redact
                """
            }
        }

        /* ----------------------------------------------------
           VULNERABILITY SCAN (FAIL IF HIGH/CRITICAL ISSUES)
        ---------------------------------------------------- */
        stage('Code Vulnerability Scan (Trivy FS)') {
            steps {
                bat """
                    echo Running Trivy filesystem scan...
                    docker run --rm ^
                        -v %CD%:/repo ^
                        aquasec/trivy:latest fs /repo ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
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

        /* ----------------------------------------------------
           DOCKER IMAGE VULNERABILITY SCAN (FAIL IF ISSUES)
        ---------------------------------------------------- */
        stage('Image Vulnerability Scan (Trivy Image)') {
            steps {
                bat """
                    echo Scanning Docker Image for vulnerabilities...
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
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

            slackSend(
                webhookUrl: credentials('slack-webhook'),
                channel: '#ci-cd-pipeline',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}

Regards,
Jenkins
""",
                attachLog: true
            )
        }

        failure {
            echo "Pipeline Failed!"

            slackSend(
                webhookUrl: credentials('slack-webhook'),
                channel: '#ci-cd-pipeline',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline FAILED.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}

Check logs:
${env.BUILD_URL}console

Regards,
Jenkins
""",
                attachLog: true
            )
        }
    }
}
