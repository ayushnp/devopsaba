pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"
        IS_PR = "false"
    }

    stages {

        /* --------------------------------------------------------
           DETECT PR BUILD
        -------------------------------------------------------- */
        stage('Determine Build Type') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        env.IS_PR = "true"
                        env.PR_ID = env.CHANGE_ID
                        env.PR_CONTAINER = "devopsaba-pr-${env.PR_ID}"
                        env.PR_PORT = (5000 + env.PR_ID.toInteger()).toString()

                        // Public IP fetch for PR preview
                        def ip = bat(
                            script: 'powershell -command "(Invoke-WebRequest -uri \'https://api.ipify.org\').Content"',
                            returnStdout: true
                        ).trim()

                        env.HOST_IP = ip ?: "127.0.0.1"

                        echo "🔵 Pull Request Build Detected"
                        echo "PR ID: ${env.PR_ID}"
                        echo "Preview Port: ${env.PR_PORT}"
                        echo "Host IP: ${env.HOST_IP}"
                    } else {
                        env.IS_PR = "false"
                        echo "🟢 Main Branch Build Detected"
                    }
                }
            }
        }

        /* --------------------------------------------------------
           CHECKOUT SOURCE CODE
        -------------------------------------------------------- */
        stage('Checkout Code') {
            steps { checkout scm }
        }

        /* --------------------------------------------------------
           SECURITY SCAN — GITLEAKS
        -------------------------------------------------------- */
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

        /* --------------------------------------------------------
           SECURITY SCAN — TRIVY FS
        -------------------------------------------------------- */
        stage('Trivy FS Scan') {
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
           BUILD DOCKER IMAGE
        -------------------------------------------------------- */
        stage('Build Docker Image') {
            steps {
                bat """
                    docker build -t %IMAGE_VERSION% .
                    docker tag %IMAGE_VERSION% %IMAGE%
                """
            }
        }

        /* --------------------------------------------------------
           PR DEPLOYMENT
        -------------------------------------------------------- */
        stage('Deploy PR Environment') {
            when { expression { env.IS_PR == "true" } }
            steps {
                bat """
                    docker stop ${env.PR_CONTAINER} || echo No container
                    docker rm ${env.PR_CONTAINER} || echo No container
                    docker run -d -p ${env.PR_PORT}:5000 --name ${env.PR_CONTAINER} %IMAGE_VERSION%
                """

                echo "🌐 PR PREVIEW AVAILABLE!"
                echo "➡ http://${env.HOST_IP}:${env.PR_PORT}/"
            }
        }

        /* --------------------------------------------------------
           MAIN BRANCH — TRIVY IMAGE SCAN (FIXED)
        -------------------------------------------------------- */
        stage('Image Scan (Trivy Image)') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
            }
        }

        /* --------------------------------------------------------
           PUSH TO DOCKER HUB
        -------------------------------------------------------- */
        stage('DockerHub Login') {
            when { expression { env.IS_PR == "false" } }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat """ echo %PASS% | docker login -u %USER% --password-stdin """
                }
            }
        }

        stage('Push Image') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker push %IMAGE_VERSION%
                    docker push %IMAGE%
                """
            }
        }

        /* --------------------------------------------------------
           DEPLOY TO PRODUCTION
        -------------------------------------------------------- */
        stage('Deploy to Production') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker stop devopsaba || echo No container
                    docker rm devopsaba || echo No container
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        /* --------------------------------------------------------
           AUTO-ROLLBACK
        -------------------------------------------------------- */
        stage('Verify & Auto Rollback') {
            when { expression { env.IS_PR == "false" } }
            steps {
                script {
                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba 2>NUL',
                        returnStdout: true
                    ).trim().toLowerCase()

                    if (!running.contains("true")) {

                        echo "❌ Deployment Failed — Starting Rollback..."

                        bat "docker stop devopsaba || echo No container"
                        bat "docker rm devopsaba || echo No container"

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("❗ No previous stable image exists to rollback.")
                        }

                        def last = readFile(env.LAST_SUCCESS_FILE).trim()

                        bat "docker run -d -p 5000:5000 --name devopsaba ${last}"

                        error("Rollback completed — Deployment failed.")
                    }

                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    echo "✔ Deployment Healthy — Saved as stable"
                }
            }
        }
    }

    /* --------------------------------------------------------
       POST ACTIONS (Notifications & Cleanup)
    -------------------------------------------------------- */
    post {

        // Executes ONLY when branch or PR is deleted or completed
        cleanup {
            script {
                if (env.IS_PR == "true") {
                    echo "🧹 Removing PR environment..."
                    bat "docker stop ${env.PR_CONTAINER} || echo Already stopped"
                    bat "docker rm ${env.PR_CONTAINER} || echo Already removed"
                }
            }
        }

        success {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }

        failure {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
