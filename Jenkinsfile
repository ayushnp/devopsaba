pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"

        // PR Preview Tags
        PREVIEW_IMAGE = "ayushnp10/devopsaba:pr-${CHANGE_ID}"
        PREVIEW_CONTAINER = "devopsaba-pr-${CHANGE_ID}"
        // PREVIEW_PORT will be calculated later
    }

    stages {

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
                        --ignore-unfixed ^
                        --exit-code 1
                """
            }
        }

        /* --------------------------------------------------------
           COMPUTE PR PREVIEW PORT (ONLY FOR PR BUILDS)
        -------------------------------------------------------- */
        stage('Compute Preview Port') {
            when { expression { return env.CHANGE_ID } }
            steps {
                script {
                    def basePort = 6000
                    env.PREVIEW_PORT = (basePort + env.CHANGE_ID.toInteger()).toString()
                    echo "Computed Preview Port = ${env.PREVIEW_PORT}"
                }
            }
        }

        /* --------------------------------------------------------
           BUILD DOCKER IMAGE
           (PR builds → preview image, main → production image)
        -------------------------------------------------------- */
        stage('Build Docker Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "📌 Building PR Preview Image"
                        bat "docker build -t ${env.PREVIEW_IMAGE} ."
                    } else {
                        echo "📌 Building Production Image"
                        bat """
                            docker build -t ${env.IMAGE_VERSION} .
                            docker tag ${env.IMAGE_VERSION} ${env.IMAGE}
                        """
                    }
                }
            }
        }

        /* --------------------------------------------------------
           IMAGE SCAN
        -------------------------------------------------------- */
        stage('Image Scan (Trivy Image)') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        bat """
                            docker run --rm aquasec/trivy:latest image ${env.PREVIEW_IMAGE} ^
                                --severity HIGH,CRITICAL ^
                                --ignore-unfixed ^
                                --exit-code 1
                        """
                    } else {
                        bat """
                            docker run --rm aquasec/trivy:latest image ${env.IMAGE} ^
                                --severity HIGH,CRITICAL ^
                                --ignore-unfixed ^
                                --exit-code 1
                        """
                    }
                }
            }
        }

        /* --------------------------------------------------------
           DOCKER HUB LOGIN
        -------------------------------------------------------- */
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

        /* --------------------------------------------------------
           PUSH IMAGE
        -------------------------------------------------------- */
        stage('Push Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        bat """ docker push ${env.PREVIEW_IMAGE} """
                    } else {
                        bat """
                            docker push ${env.IMAGE_VERSION}
                            docker push ${env.IMAGE}
                        """
                    }
                }
            }
        }

        /* --------------------------------------------------------
           🚀 PR PREVIEW DEPLOYMENT (ONLY FOR PULL REQUESTS)
        -------------------------------------------------------- */
        stage('Deploy Preview Environment (PR Only)') {
            when { expression { return env.CHANGE_ID } }
            steps {
                script {
                    echo "🚀 Deploying Preview Environment for PR #${env.CHANGE_ID}"

                    bat "docker stop ${env.PREVIEW_CONTAINER} || echo none"
                    bat "docker rm ${env.PREVIEW_CONTAINER} || echo none"

                    bat """
                        docker run -d -p ${env.PREVIEW_PORT}:5000 ^
                        --name ${env.PREVIEW_CONTAINER} ${env.PREVIEW_IMAGE}
                    """

                    echo "🌐 Preview URL:"
                    echo "👉 http://<your-server-ip>:${env.PREVIEW_PORT}/"
                }
            }
        }

        /* --------------------------------------------------------
           🧹 DELETE PREVIEW WHEN PR IS CLOSED
        -------------------------------------------------------- */
        stage('Destroy Preview (PR Closed)') {
            when {
                allOf {
                    expression { return env.CHANGE_ID }
                    expression { return env.CHANGE_ACTION == "closed" }
                }
            }
            steps {
                echo "🧹 Pull Request closed — deleting preview environment."
                bat "docker stop ${env.PREVIEW_CONTAINER} || echo none"
                bat "docker rm ${env.PREVIEW_CONTAINER} || echo none"
            }
        }

        /* --------------------------------------------------------
           DEPLOY TO PRODUCTION (ONLY WHEN BRANCH = main)
        -------------------------------------------------------- */
        stage('Deploy to Production') {
            when { branch 'main' }
            steps {
                bat """
                    docker stop devopsaba || echo No container
                    docker rm devopsaba || echo No container
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        /* --------------------------------------------------------
           AUTO-ROLLBACK SYSTEM
        -------------------------------------------------------- */
        stage('Verify & Auto Rollback') {
            when { branch 'main' }
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

    /* --------------------------------------------------------
       POST: EMAIL + SLACK NOTIFICATIONS
    -------------------------------------------------------- */
    post {

        success {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com,
                     aadyambhat2005@gmail.com,
                     lohithbandla5@gmail.com,
                     bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Status: SUCCESS

${
env.CHANGE_ID ?
"Preview URL: http://<your-server-ip>:" + env.PREVIEW_PORT :
"Production deployment completed."
}

Build Log:
${env.BUILD_URL}console

Regards,
Jenkins
                """,
                attachLog: true
            )
        }

        failure {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com,
                     aadyambhat2005@gmail.com,
                     lohithbandla5@gmail.com,
                     bhargavisriinivas@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline has FAILED.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}

View logs:
${env.BUILD_URL}console

Regards,
Jenkins
                """,
                attachLog: true
            )
        }
    }
}
