pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "C:\\ProgramData\\Jenkins\\last_success_image.txt"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ayushnp/devopsaba.git'
            }
        }

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
                    echo Building versioned Docker Image...
                    docker build -t %IMAGE_VERSION% .
                    docker tag %IMAGE_VERSION% %IMAGE%
                """
            }
        }

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
                    docker push %IMAGE_VERSION%
                    docker push %IMAGE%
                """
            }
        }

        stage('Deploy Container') {
            steps {
                bat """
                    echo Stopping old container...
                    docker stop devopsaba || echo No container

                    echo Removing old container...
                    docker rm devopsaba || echo No container

                    echo Deploying new container...
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        /* ------------------------------------------
           AUTO ROLLBACK ON DEPLOYMENT FAILURE
        ------------------------------------------- */
        stage('Verify Deployment & Auto Rollback') {
            steps {
                script {
                    echo "Checking if new container is running..."

                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba',
                        returnStdout: true
                    ).trim()

                    if (running != "true") {
                        echo "❌ Deployment FAILED — Rolling back..."

                        // Stop failed container
                        bat 'docker stop devopsaba || echo No container'
                        bat 'docker rm devopsaba || echo No container'

                        // Read last successful image
                        def lastImage = readFile(env.LAST_SUCCESS_FILE).trim()

                        echo "Rolling back to previous stable image: ${lastImage}"

                        // Start last stable container
                        bat """
                            docker run -d -p 5000:5000 --name devopsaba ${lastImage}
                        """

                        error("Deployment failed. Rollback executed.")
                    } else {
                        echo "✔ Deployment successful. Saving this version as last stable."
                        writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    }
                }
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
                body: "The pipeline completed successfully.",
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
                body: "The pipeline FAILED. Check logs.",
                attachLog: true
            )
        }
    }
}
