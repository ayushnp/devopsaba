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

                        // Use faster working method to fetch public IP
                        def ip = bat(
                            script: 'powershell -command "(Invoke-WebRequest -uri \'https://api.ipify.org\').Content"',
                            returnStdout: true
                        ).trim()

                        if (!ip || ip == "") {
                            ip = "127.0.0.1"
                        }

                        env.HOST_IP = ip

                        echo "🔵 Pull Request Build Detected"
                        echo "PR ID       : ${env.PR_ID}"
                        echo "Container   : ${env.PR_CONTAINER}"
                        echo "Port        : ${env.PR_PORT}"
                        echo "Host IP     : ${env.HOST_IP}"

                    } else {
                        env.IS_PR = "false"
                        echo "🟢 MAIN Branch Build"
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
           SECURITY SCAN 1 — GITLEAKS
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
           SECURITY SCAN 2 — TRIVY FS
        -------------------------------------------------------- */
        stage('Trivy FS Scan') {
            steps {
                bat """
                    docker run --rm ^
                        -v %CD%:/repo ^
                        aquasec/trivy:latest fs /repo ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1 ^
                        --skip-db-update
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
           PR DEPLOYMENT (TEMPORARY ENVIRONMENT)
        -------------------------------------------------------- */
        stage('Deploy PR Environment') {
            when { expression { env.IS_PR == "true" } }
            steps {
                bat """
                    docker stop ${env.PR_CONTAINER} || echo No container
                    docker rm ${env.PR_CONTAINER} || echo No container
                    docker run -d -p ${env.PR_PORT}:5000 --name ${env.PR_CONTAINER} %IMAGE_VERSION%
                """

                echo "🌐 PR PREVIEW LIVE!"
                echo "👉 http://${env.HOST_IP}:${env.PR_PORT}/"
            }
        }

        /* --------------------------------------------------------
           MAIN BRANCH ONLY — Image Scan & Deployment
        -------------------------------------------------------- */

        stage('Image Scan (Trivy Image)') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1 ^
                        --skip-db-update
                """
            }
        }

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
           AUTO ROLLBACK SYSTEM
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

                        echo "❌ Deployment Failed — Rolling Back..."

                        bat "docker stop devopsaba || echo No container"
                        bat "docker rm devopsaba || echo No container"

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("⚠ No previous stable image found")
                        }

                        def last = readFile(env.LAST_SUCCESS_FILE).trim()

                        bat "docker run -d -p 5000:5000 --name devopsaba ${last}"

                        error("Rollback executed due to failure.")
                    }

                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    echo "✔ Deployment Healthy — Marked Stable"
                }
            }
        }
    }

    /* --------------------------------------------------------
       POST ACTIONS
    -------------------------------------------------------- */
    post {

        // IMPORTANT: Clean PR env ONLY on PR close, not every build.
        cleanup {
            script {
                if (env.IS_PR == "true") {
                    echo "🧹 Cleaning PR Environment (PR Closed)…"
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
