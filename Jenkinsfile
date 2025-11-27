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
           STAGE 1 — Detect PR Build
        -------------------------------------------------------- */
        stage('Determine Build Type') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        env.IS_PR = "true"
                        env.PR_ID = env.CHANGE_ID
                        env.PR_CONTAINER = "devopsaba-pr-${env.PR_ID}"
                        env.PR_PORT = (5000 + env.PR_ID.toInteger()).toString()

                        echo "🔵 Pull Request Build Detected"
                        echo "PR ID       : ${env.PR_ID}"
                        echo "PR Container: ${env.PR_CONTAINER}"
                        echo "PR Port     : ${env.PR_PORT}"
                    } else {
                        env.IS_PR = "false"
                        echo "🟢 Main Branch Build"
                    }
                }
            }
        }

        /* -------------------------------------------------------- */
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        /* -------------------------------------------------------- */
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

        /* -------------------------------------------------------- */
        stage('Code Vulnerability Scan (Trivy FS)') {
            steps {
                bat """
                    docker run --rm ^
                        -v %CD%:/repo ^
                        aquasec/trivy:latest fs /repo ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1 ^
                        --light ^
                        --skip-db-update
                """
            }
        }

        /* -------------------------------------------------------- */
        stage('Build Docker Image') {
            steps {
                bat """
                    docker build -t %IMAGE_VERSION% .
                    docker tag %IMAGE_VERSION% %IMAGE%
                """
            }
        }

        /* --------------------------------------------------------
           PR: Deploy Temporary Environment
        -------------------------------------------------------- */
        stage('Deploy PR Environment') {
            when { expression { env.IS_PR == "true" } }
            steps {
                bat """
                    docker stop ${env.PR_CONTAINER} || echo No container
                    docker rm ${env.PR_CONTAINER} || echo No container

                    docker run -d -p ${env.PR_PORT}:5000 --name ${env.PR_CONTAINER} %IMAGE_VERSION%
                """

                echo "🌐 Preview URL: http://YOUR_PUBLIC_IP:${env.PR_PORT}/"
                echo "💡 This environment will be deleted when PR is closed."
            }
        }

        /* --------------------------------------------------------
           MAIN BRANCH ONLY
        -------------------------------------------------------- */
        stage('Image Vulnerability Scan (Trivy Image)') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1 ^
                        --light ^
                        --skip-db-update
                """
            }
        }

        stage('Login to Docker Hub') {
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

        stage('Push Image to Docker Hub') {
            when { expression { env.IS_PR == "false" } }
            steps {
                bat """
                    docker push %IMAGE_VERSION%
                    docker push %IMAGE%
                """
            }
        }

        stage('Deploy Container') {
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
        stage('Verify Deployment & Auto Rollback') {
            when { expression { env.IS_PR == "false" } }
            steps {
                script {

                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba 2>NUL',
                        returnStdout: true
                    ).trim().toLowerCase().replace('"','')

                    if (!running.contains("true")) {
                        echo "❌ Deployment Failure — Rolling Back..."

                        bat 'docker stop devopsaba || echo No container'
                        bat 'docker rm devopsaba || echo No container'

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("⚠ No previous stable image to rollback to.")
                        }

                        def lastImage = readFile(env.LAST_SUCCESS_FILE).trim()

                        bat """
                            docker run -d -p 5000:5000 --name devopsaba ${lastImage}
                        """

                        error("Rollback executed because deployment failed.")
                    }

                    echo "✔ Deployment OK — Saving stable version"
                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                }
            }
        }
    }

    /* --------------------------------------------------------
       POST ACTIONS
    -------------------------------------------------------- */
    post {

        always {
            script {
                if (env.IS_PR == "true") {
                    echo "🧹 Cleaning PR Environment..."
                    bat "docker stop ${env.PR_CONTAINER} || echo Not running"
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
