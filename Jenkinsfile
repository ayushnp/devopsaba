pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"

        // Rollback file stored in workspace
        LAST_SUCCESS_FILE = "last_success_image.txt"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ayushnp/devopsaba.git'
            }
        }

        /* -------------------------------  
           SECRET LEAK SCAN
        ------------------------------- */
        stage('Secret Scan (Gitleaks)') {
            steps {
                bat """
                    docker run --rm ^
                        -v %CD%:/repo ^
                        zricethezav/gitleaks:latest detect ^
                        --source=/repo ^
                        --exit-code 1 ^
                        --redact
                """
            }
        }

        /* -------------------------------  
           FILESYSTEM VULNERABILITY SCAN
        ------------------------------- */
        stage('Code Vulnerability Scan (Trivy FS)') {
            steps {
                bat """
                    docker run --rm ^
                        -v %CD%:/repo ^
                        aquasec/trivy:latest fs /repo ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
            }
        }

        /* -------------------------------  
           DOCKER BUILD
        ------------------------------- */
        stage('Build Docker Image') {
            steps {
                bat """
                    docker build -t %IMAGE_VERSION% .
                    docker tag %IMAGE_VERSION% %IMAGE%
                """
            }
        }

        /* -------------------------------  
           IMAGE VULNERABILITY SCAN
        ------------------------------- */
        stage('Image Vulnerability Scan (Trivy Image)') {
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
            }
        }

        /* -------------------------------  
           DOCKER LOGIN
        ------------------------------- */
        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat """
                        echo %PASS% | docker login -u %USER% --password-stdin
                    """
                }
            }
        }

        /* -------------------------------  
           PUSH IMAGE
        ------------------------------- */
        stage('Push Image to Docker Hub') {
            steps {
                bat """
                    docker push %IMAGE_VERSION%
                    docker push %IMAGE%
                """
            }
        }

        /* -------------------------------  
           DEPLOY NEW CONTAINER
        ------------------------------- */
        stage('Deploy Container') {
            steps {
                bat """
                    docker stop devopsaba || echo No container
                    docker rm devopsaba || echo No container
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        /* ------------------------------------------------
           VERIFY DEPLOYMENT + AUTO ROLLBACK
        ------------------------------------------------ */
        stage('Verify Deployment & Auto Rollback') {
            steps {
                script {

                    echo "Checking if new container is running..."

                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba 2>NUL',
                        returnStdout: true
                    ).trim()

                    running = running
                        .toLowerCase()
                        .replace('"', '')
                        .replace("\r", "")
                        .replace("\n", "")
                        .trim()

                    echo "Docker returned: '${running}'"

                    // *** FINAL FIX: Windows-safe check ***
                    if (!running.contains("true")) {

                        echo "❌ Deployment FAILED — Attempting rollback..."

                        bat 'docker stop devopsaba || echo No container'
                        bat 'docker rm devopsaba || echo No container'

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            echo "⚠ No previous stable image found. Cannot rollback."
                            error("Deployment failed and no rollback image exists.")
                        }

                        def lastImage = readFile(env.LAST_SUCCESS_FILE).trim()
                        echo "Rolling back to: ${lastImage}"

                        bat """
                            docker run -d -p 5000:5000 --name devopsaba ${lastImage}
                        """

                        error("Deployment failed. Rollback executed.")
                    } 
                    else {
                        echo "✔ Deployment successful — saving stable version"
                        writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    }
                }
            }
        }
    }

    /* -------------------------------
       NOTIFICATIONS
    ------------------------------- */
    post {

        success {
            echo "CI/CD Pipeline Completed Successfully!"

            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed successfully.",
                attachLog: true
            )
        }

        failure {
            echo "Pipeline Failed!"

            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
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
