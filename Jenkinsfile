pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"

        PREVIEW_IMAGE = "ayushnp10/devopsaba:pr-${CHANGE_ID}"
        PREVIEW_CONTAINER = "devopsaba-pr-${CHANGE_ID}"
        PREVIEW_PORT = "$((5000 + CHANGE_ID as Integer))"
    }

    stages {

        stage('Checkout Code') {
            steps { checkout scm }
        }

        /* -------------------------------
           SECURITY SCANS
        --------------------------------*/
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

        stage('Trivy FS Scan') {
            steps {
                bat """
                    docker run --rm ^
                        -v %CD%:/repo ^
                        aquasec/trivy:latest fs /repo ^
                        --severity HIGH,CRITICAL ^
                        --ignore-unfixed ^
                        --exit-code 1
                """
            }
        }

        /* -------------------------------------------
           BUILD DOCKER IMAGE (PR or MAIN)
        -------------------------------------------- */
        stage('Build Docker Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "📌 PR BUILD DETECTED — Using PR Tag"
                        bat """
                            docker build -t %PREVIEW_IMAGE% .
                        """
                    } else {
                        echo "📌 MAIN BRANCH — Building Production Image"
                        bat """
                            docker build -t %IMAGE_VERSION% .
                            docker tag %IMAGE_VERSION% %IMAGE%
                        """
                    }
                }
            }
        }

        /* -------------------------------------------
           TRIVY SCAN FOR BOTH TYPES
        -------------------------------------------- */
        stage('Scan Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        bat """
                            docker run --rm aquasec/trivy:latest image %PREVIEW_IMAGE% ^
                                --severity HIGH,CRITICAL ^
                                --ignore-unfixed ^
                                --exit-code 1
                        """
                    } else {
                        bat """
                            docker run --rm aquasec/trivy:latest image %IMAGE% ^
                                --severity HIGH,CRITICAL ^
                                --ignore-unfixed ^
                                --exit-code 1
                        """
                    }
                }
            }
        }

        /* -------------------------------------------
           PUSH IMAGE (PR or MAIN)
        -------------------------------------------- */
        stage('DockerHub Login') {
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
            steps {
                script {
                    if (env.CHANGE_ID) {
                        bat """ docker push %PREVIEW_IMAGE% """
                    } else {
                        bat """
                            docker push %IMAGE_VERSION%
                            docker push %IMAGE%
                        """
                    }
                }
            }
        }

        /* ---------------------------------------------------
           ⭐ NEW FEATURE: PR Preview Environment Deployment
        -----------------------------------------------------*/
        stage('Deploy Preview Environment (PR Only)') {
            when { expression { return env.CHANGE_ID } }
            steps {
                script {
                    echo "🚀 Deploying Preview Environment for PR #${CHANGE_ID}"

                    bat "docker stop %PREVIEW_CONTAINER% || echo none"
                    bat "docker rm %PREVIEW_CONTAINER% || echo none"

                    bat """
                        docker run -d -p %PREVIEW_PORT%:5000 ^
                        --name %PREVIEW_CONTAINER% %PREVIEW_IMAGE%
                    """

                    echo "🌐 Preview URL:"
                    echo "👉 http://<your-server-ip>:%PREVIEW_PORT%/"
                }
            }
        }

        /* -----------------------------------------------------------------
           DELETE PREVIEW ENVIRONMENT WHEN PR IS CLOSED
        ------------------------------------------------------------------ */
        stage('Destroy Preview (PR Closed)') {
            when {
                allOf {
                    expression { return env.CHANGE_ID }
                    expression { return env.CHANGE_TARGET == "main" }
                    expression { return env.CHANGE_ACTION == "closed" }
                }
            }
            steps {
                echo "🧹 PR Closed — Removing Preview Environment"
                bat "docker stop %PREVIEW_CONTAINER% || echo none"
                bat "docker rm %PREVIEW_CONTAINER% || echo none"
            }
        }

        /* -------------------------------------------------------
           PROD DEPLOYMENT (ONLY MAIN BRANCH)
        --------------------------------------------------------*/
        stage('Deploy to Production') {
            when { branch "main" }
            steps {
                bat """
                    docker stop devopsaba || echo none
                    docker rm devopsaba || echo none
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        /* -------------------------------------------------------
           ROLLBACK (ONLY MAIN)
        --------------------------------------------------------*/
        stage('Verify & Auto Rollback') {
            when { branch "main" }
            steps {
                script {
                    def running = bat(
                        script: 'docker inspect -f "{{.State.Running}}" devopsaba 2>NUL',
                        returnStdout: true
                    ).trim().toLowerCase()

                    if (!running.contains("true")) {

                        echo "❌ Deployment Failed — Starting Rollback..."
                        bat "docker stop devopsaba || echo none"
                        bat "docker rm devopsaba || echo none"

                        if (!fileExists(env.LAST_SUCCESS_FILE)) {
                            error("❗ No previous stable image exists for rollback.")
                        }

                        def last = readFile(env.LAST_SUCCESS_FILE).trim()

                        bat "docker run -d -p 5000:5000 --name devopsaba ${last}"
                        error("Rollback executed — Deployment failed.")
                    }

                    writeFile file: env.LAST_SUCCESS_FILE, text: env.IMAGE_VERSION
                    echo "✔ Deployment Healthy — Saved as stable"
                }
            }
        }
    }

    /* ----------------------------
       NOTIFICATIONS
    -------------------------------*/
    post {
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
