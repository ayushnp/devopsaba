pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"
        
        // PR Preview Environment Variables
        PREVIEW_IMAGE = "${env.CHANGE_ID ? \"ayushnp10/devopsaba:pr-${env.CHANGE_ID}\" : \"\"}"
        PREVIEW_CONTAINER = "${env.CHANGE_ID ? \"preview-${env.CHANGE_ID}\" : \"\"}"
        PREVIEW_PORT = "${env.CHANGE_ID ? (6000 + env.CHANGE_ID.toInteger()) : 0}"
        SERVER_IP = "YOUR-JENKINS-SERVER-IP"  // Replace with your actual server IP
    }

    stages {
        stage('Checkout Code') {
            steps { checkout scm }
        }

        stage('Detect Pull Request') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🔵 PR DETECTED: #${env.CHANGE_ID} (${env.CHANGE_BRANCH})"
                        echo "Preview: ${PREVIEW_IMAGE} -> port ${PREVIEW_PORT}"
                    } else {
                        echo "🟢 PRODUCTION BUILD (main branch)"
                    }
                }
            }
        }

        // Security scans ONLY for production builds
        stage('Secret Scan (Gitleaks)') {
            when { expression { return env.CHANGE_ID == null } }
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

        stage('Trivy FS Scan') {
            when { expression { return env.CHANGE_ID == null } }
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

        stage('Build Docker Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🔨 Building PR Preview Image..."
                        bat "docker build -t ${PREVIEW_IMAGE} ."
                    } else {
                        echo "🔨 Building Production Image..."
                        bat """
                            docker build -t %IMAGE_VERSION% .
                            docker tag %IMAGE_VERSION% %IMAGE%
                        """
                    }
                }
            }
        }

        // PR Preview Deployment
        stage('Deploy PR Preview') {
            when { expression { return env.CHANGE_ID != null } }
            steps {
                script {
                    echo "🚀 Deploying Preview Environment..."
                    
                    // Cleanup old preview
                    bat "docker stop ${PREVIEW_CONTAINER} || echo 'No old container'"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo 'No old container'"
                    
                    // Deploy new preview
                    bat """
                        docker run -d ^
                            -p ${PREVIEW_PORT}:4000 ^
                            --name ${PREVIEW_CONTAINER} ^
                            ${PREVIEW_IMAGE}
                    """
                    
                    def previewUrl = "http://${SERVER_IP}:${PREVIEW_PORT}"
                    echo "🌐 PREVIEW URL: ${previewUrl}"
                    
                    // Slack notification
                    slackSend(
                        channel: '#ci-cd-pipeline',
                        tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                        message: "🟦 PR #${env.CHANGE_ID} Preview Ready! ${previewUrl}"
                    )
                }
            }
        }

        // Production pipeline (skipped for PRs)
        stage('Image Scan (Trivy Image)') {
            when { expression { return env.CHANGE_ID == null } }
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
            }
        }

        stage('DockerHub Login') {
            when { expression { return env.CHANGE_ID == null } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat "echo %PASS% | docker login -u %USER% --password-stdin"
                }
            }
        }

        stage('Push Image') {
            when { expression { return env.CHANGE_ID == null } }
            steps {
                bat """
                    docker push %IMAGE_VERSION%
                    docker push %IMAGE%
                """
            }
        }

        stage('Deploy to Production') {
            when { expression { return env.CHANGE_ID == null } }
            steps {
                bat """
                    docker stop devopsaba || echo No container
                    docker rm devopsaba || echo No container
                    docker run -d -p 5000:4000 --name devopsaba %IMAGE%
                """
            }
        }

        stage('Verify & Auto Rollback') {
            when { expression { return env.CHANGE_ID == null } }
            steps {
                script {
                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba 2>NUL || echo false',
                        returnStdout: true
                    ).trim().toLowerCase()

                    if (!running.contains("true")) {
                        echo "❌ DEPLOYMENT FAILED — ROLLBACK..."
                        bat "docker stop devopsaba || echo No container"
                        bat "docker rm devopsaba || echo No container"

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("❗ No rollback image available")
                        }

                        def lastImage = readFile(env.LAST_SUCCESS_FILE).trim()
                        bat "docker run -d -p 5000:4000 --name devopsaba ${lastImage}"
                        error("Rollback completed")
                    }

                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    echo "✅ Production deployment healthy"
                }
            }
        }
    }

    post {
        // Auto-cleanup PR environments
        cleanup {
            script {
                if (env.CHANGE_ID) {
                    echo "🧹 Cleaning PR ${env.CHANGE_ID} environment..."
                    bat "docker stop ${PREVIEW_CONTAINER} || echo No container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo No container"
                }
            }
        }

        success {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ ${env.CHANGE_ID ? 'PR Preview' : 'Production'} SUCCESS: ${env.JOB_NAME} #${BUILD_NUMBER}"
            )
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${BUILD_NUMBER}",
                body: "Pipeline completed successfully. Logs: ${env.BUILD_URL}console",
                attachLog: true
            )
        }

        failure {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ ${env.CHANGE_ID ? 'PR Preview' : 'Production'} FAILED: ${env.JOB_NAME} #${BUILD_NUMBER}"
            )
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${BUILD_NUMBER}",
                body: "Pipeline failed. Logs: ${env.BUILD_URL}console",
                attachLog: true
            )
        }
    }
}
