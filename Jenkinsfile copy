pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"
        
        // PR Preview Environment Variables
        PREVIEW_IMAGE = "${env.CHANGE_ID ? "ayushnp10/devopsaba:pr-${env.CHANGE_ID}" : ""}"
        PREVIEW_CONTAINER = "${env.CHANGE_ID ? "preview-${env.CHANGE_ID}" : ""}"
        PREVIEW_PORT = "${env.CHANGE_ID ? (6000 + env.CHANGE_ID.toInteger()) : 0}"
        SERVER_IP = "10.38.136.212"
    }

    stages {

        /* --------------------------------------------------------
           CHECKOUT SOURCE
        -------------------------------------------------------- */
        stage('Checkout Code') {
            steps { checkout scm }
        }

        /* --------------------------------------------------------
           DETECT PR
        -------------------------------------------------------- */
        stage('Detect Pull Request') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🔵 PR DETECTED: #${env.CHANGE_ID} (${env.CHANGE_BRANCH})"
                        echo "Preview image: ${PREVIEW_IMAGE}"
                        echo "Preview port:  ${PREVIEW_PORT}"
                    } else {
                        echo "🟢 PRODUCTION BUILD"
                    }
                }
            }
        }

        /* --------------------------------------------------------
           SECURITY SCANS (PRODUCTION ONLY)
        -------------------------------------------------------- */
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

        /* --------------------------------------------------------
           BUILD IMAGE (PR OR PROD)
        -------------------------------------------------------- */
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

        /* --------------------------------------------------------
           DEPLOY PR PREVIEW ENVIRONMENT
        -------------------------------------------------------- */
        stage('Deploy PR Preview') {
            when { expression { return env.CHANGE_ID != null } }
            steps {
                script {
                    echo "🚀 Deploying PR Preview Environment..."

                    // Remove older preview instance
                    bat "docker stop ${PREVIEW_CONTAINER} || echo No old instance"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo Already removed"

                    // Run preview container
                    bat """
                        docker run -d ^
                            -p ${PREVIEW_PORT}:4000 ^
                            --name ${PREVIEW_CONTAINER} ^
                            ${PREVIEW_IMAGE}
                    """

                    def previewUrl = "http://${SERVER_IP}:${PREVIEW_PORT}"
                    echo "🌐 PREVIEW URL: ${previewUrl}"

                    slackSend(
                        channel: '#ci-cd-pipeline',
                        tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                        message: "🟦 PR #${env.CHANGE_ID} Preview Ready → ${previewUrl}"
                    )
                }
            }
        }

        /* --------------------------------------------------------
           PRODUCTION PIPELINE (SKIPPED IN PR)
        -------------------------------------------------------- */
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
                        echo "❌ Deployment Failed — Rolling Back..."

                        bat "docker stop devopsaba || echo No container"
                        bat "docker rm devopsaba || echo No container"

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("❗ No stable image found for rollback.")
                        }

                        def lastImage = readFile(env.LAST_SUCCESS_FILE).trim()

                        bat "docker run -d -p 5000:4000 --name devopsaba ${lastImage}"

                        error("Rollback executed.")
                    }

                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    echo "✅ Production Deployment Healthy."
                }
            }
        }
    }

    /* --------------------------------------------------------
       POST ACTIONS
    -------------------------------------------------------- */
    post {

        /* CLEAN PREVIEW ENV ON PR CLOSE */
        cleanup {
            script {
                if (env.CHANGE_ID) {
                    echo "🧹 Cleaning PR Preview Environment..."
                    bat "docker stop ${PREVIEW_CONTAINER} || echo No container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo No container"
                }
            }
        }

        success {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.CHANGE_ID ? 'PR Preview' : 'Production'} Build #${env.BUILD_NUMBER}"
            )
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed successfully.\nLogs: ${env.BUILD_URL}console",
                attachLog: true
            )
        }

        failure {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ FAILED: ${env.CHANGE_ID ? 'PR Preview' : 'Production'} Build #${env.BUILD_NUMBER}"
            )
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline FAILED.\nLogs: ${env.BUILD_URL}console",
                attachLog: true
            )
        }
    }
}
