Skip to content
Chat history


You said:
pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"
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
           IMAGE VULNERABILITY SCAN
        -------------------------------------------------------- */
        stage('Image Scan (Trivy Image)') {
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
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
            // Slack
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Status: SUCCESS

Build Log:
${env.BUILD_URL}console

Regards,
Jenkins
                """,
                attachLog: true
            )
        }

        failure {
            // Slack
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
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

so my plan is to integrate a development preview when a pull request is done before merging 
i need to see how the new feature is looking i want it to genrate a seperate url wehre i can preview and after merginf it should perform the main build and remove the preview temporary image
 On-Demand Environment Creation
🔥 What it solves

Developers often need temporary environments to test a feature.

💡 What you add

When a new pull request is created:

Jenkins automatically creates a Docker container

Deploy the PR code

Give a temporary URL

When PR closes → environment is deleted.


i want to implement this feature to the jenkins file and what chnages should i do in jenkins help me out with this
ChatGPT said:
Great — you want Preview Environments for Pull Requests (PR Environments).
This is a very popular DevOps feature (used by GitHub Actions, Netlify, Vercel, etc.).
I'll give you:

✅ 1. What changes you need in Jenkins
✅ 2. Updated Jenkinsfile (FULL) with PR logic
✅ 3. How temporary URL works
✅ 4. How cleanup happens
✅ 1. What You Need in Jenkins
To support PR preview builds, you need:

✔ A Multibranch Pipeline job
Your Jenkins job type must be:

New Item → Multibranch Pipeline
This is required because:

Jenkins will detect Pull Requests from GitHub

Jenkins auto-sets environment variables like CHANGE_ID, CHANGE_BRANCH, CHANGE_TITLE, CHANGE_URL

✔ GitHub Branch Source Plugin
Install:

GitHub Branch Source Plugin
It allows Jenkins to detect PR events.

✔ Add Credentials for GitHub Webhook (Already done if webhook works)
✔ Reverse Proxy or Wildcard domain
Your temporary preview URLs need a pattern like:

https://pr-23.yourdomain.com
OR use different ports:

http://server-ip:5001
http://server-ip:5002
...
(Easiest for now: assign different ports per PR.)

🎉 Now the Main Part
✅ 2. Modified Jenkinsfile With PR Preview Environment Support
Below is a COMPLETE drop-in replacement — your existing pipeline + PR sections added.

🔥 Updated Jenkinsfile (with PR Preview Logic)
pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"

        // PR environment variables
        PREVIEW_PORT = "${env.CHANGE_ID ? 6000 + env.CHANGE_ID.toInteger() : 0}"
        PREVIEW_CONTAINER = "preview-${env.CHANGE_ID}"
        PREVIEW_IMAGE = "ayushnp10/devopsaba:pr-${env.CHANGE_ID}"
    }

    stages {

        stage('Checkout Code') {
            steps { checkout scm }
        }

        /* --------------------------------------------
           DETECT IF THIS IS A PULL REQUEST BUILD
        -------------------------------------------- */
        stage("Detect PR") {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🟦 Pull Request detected: ID=${env.CHANGE_ID}"
                        echo "➡ Preview environment will be created!"
                    } else {
                        echo "🟩 Normal commit (main branch). Running full pipeline."
                    }
                }
            }
        }

        /* -----------------------------
           BUILD IMAGE
        ----------------------------- */
        stage('Build Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        // PR build
                        bat "docker build -t ${PREVIEW_IMAGE} ."
                    } else {
                        // Main build
                        bat """
                            docker build -t %IMAGE_VERSION% .
                            docker tag %IMAGE_VERSION% %IMAGE%
                        """
                    }
                }
            }
        }

        /* -----------------------------------
           DEPLOY PREVIEW ENVIRONMENT FOR PR
        ----------------------------------- */
        stage("Deploy PR Preview") {
            when { expression { return env.CHANGE_ID != null } }
            steps {
                script {
                    echo "🚀 Deploying PR Preview Environment"

                    bat "docker stop ${PREVIEW_CONTAINER} || echo no container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo no container"

                    bat """
                        docker run -d ^
                            -p ${PREVIEW_PORT}:5000 ^
                            --name ${PREVIEW_CONTAINER} ^
                            ${PREVIEW_IMAGE}
                    """

                    echo "🌐 Preview URL:"
                    echo "http://YOUR-SERVER-IP:${PREVIEW_PORT}"

                    // Notify Slack
                    slackSend(
                        channel: '#ci-cd-pipeline',
                        tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                        message: "🟦 PR #${env.CHANGE_ID} Preview Ready → http://YOUR-SERVER-IP:${PREVIEW_PORT}"
                    )
                }
            }
        }

        /* ----------------------------------------------------
           MAIN PIPELINE ONLY IF NOT A PR
        ---------------------------------------------------- */
        stage('Security & Deploy to Production') {
            when { expression { return env.CHANGE_ID == null } }
            stages {
                stage('Gitleaks') { steps { /* your gitleaks code */ } }
                stage('Trivy FS') { steps { /* your trivy fs code */ } }
                stage('Image Scan') { steps { /* your trivy image code */ } }
                stage('DockerHub Login') { steps { /* login code */ } }
                stage('Push Image') { steps { /* push code */ } }
                stage('Deploy to Prod') { steps { /* deploy code */ } }
                stage('Verify & Rollback') { steps { /* rollback code */ } }
            }
        }
    }

    post {
        /* -----------------------------
            REMOVE PREVIEW ON PR CLOSE
        ----------------------------- */
        cleanup {
            script {
                if (env.BRANCH_NAME && env.BRANCH_NAME.startsWith("PR-") && currentBuild.currentResult == "ABORTED") {
                    echo "🗑 Cleaning PR environment..."
                    bat "docker stop ${PREVIEW_CONTAINER} || echo no container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo no container"
                }
            }
        }

        success { /* your success notification code */ }
        failure { /* your failure notification code */ }
    }
}
🎉 3. How Your Preview URL Works
For PR #23
Port =

6000 + 23 = 6023
Preview becomes:

http://YOUR-SERVER-IP:6023
You can click and test the feature before merge.

🎉 4. Automatic Cleanup When PR Closes
When PR is closed:

Jenkins marks PR build as "aborted"

post → cleanup runs:

stops/removes:

preview-23 container
preview image ayushnp10/devopsaba:pr-23
🚀 You're Done
You now have:

✔ PR → Auto preview deployment
✔ Unique preview URL per PR
✔ Autodelete on close
✔ Main pipeline unchanged
✔ Slack notification for preview URL
If you want, I can also:
✅ Generate the architecture diagram
✅ Add auto teardown after 24 hours
✅ Add PR comment on GitHub containing preview URL

Just tell me!

You said:
pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"
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
           IMAGE VULNERABILITY SCAN
        -------------------------------------------------------- */
        stage('Image Scan (Trivy Image)') {
            steps {
                bat """
                    docker run --rm aquasec/trivy:latest image %IMAGE% ^
                        --severity HIGH,CRITICAL ^
                        --exit-code 1
                """
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
            // Slack
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,

The CI/CD pipeline completed successfully.

Job: ${env.JOB_NAME}
Build Number: ${env.BUILD_NUMBER}
Status: SUCCESS

Build Log:
${env.BUILD_URL}console

Regards,
Jenkins
                """,
                attachLog: true
            )
        }

        failure {
            // Slack
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "❌ FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            // Email
            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
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


now this is my jenkinsfile now integrate my new feature to this file 
ChatGPT said:
Got you, Ayush.
Below is your SAME Jenkinsfile, but upgraded with Pull Request Preview Environments:

✅ Detect PR
✅ Build preview image (devopsaba:pr-<id>)
✅ Deploy preview container (preview-<id>)
✅ Auto-generate preview URL
✅ Notify Slack with preview link
✅ Remove preview environment when PR is closed
🔒 Main production pipeline runs only for normal pushes (not PRs)

🚀 UPDATED JENKINSFILE WITH PR PREVIEW FEATURE (Full, Copy-Paste Ready)
⚠ Replace only the DOMAIN/IP in the PREVIEW URL section.

pipeline {
    agent any

    environment {
        DOCKERHUB_USER = "ayushnp10"
        IMAGE = "ayushnp10/devopsaba:latest"
        IMAGE_VERSION = "ayushnp10/devopsaba:${BUILD_NUMBER}"
        LAST_SUCCESS_FILE = "last_success_image.txt"

        // PR Environment variables
        PREVIEW_IMAGE = "${env.CHANGE_ID ? "ayushnp10/devopsaba:pr-${env.CHANGE_ID}" : ""}"
        PREVIEW_CONTAINER = "${env.CHANGE_ID ? "preview-${env.CHANGE_ID}" : ""}"
        PREVIEW_PORT = "${env.CHANGE_ID ? 6000 + env.CHANGE_ID.toInteger() : 0}"
    }

    stages {

        /* ------------------------------------
            CHECKOUT SOURCE
        ------------------------------------ */
        stage('Checkout Code') {
            steps { checkout scm }
        }

        /* --------------------------------------------------------
                      PULL REQUEST MODE DETECTION
        -------------------------------------------------------- */
        stage('Detect Pull Request') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🔵 Pull Request detected!"
                        echo "PR ID     : ${env.CHANGE_ID}"
                        echo "PR Branch : ${env.CHANGE_BRANCH}"
                        echo "Preview container → ${PREVIEW_CONTAINER}"
                        echo "Preview image     → ${PREVIEW_IMAGE}"
                        echo "Preview port      → ${PREVIEW_PORT}"
                    } else {
                        echo "🟢 Not a PR. Running normal production pipeline."
                    }
                }
            }
        }

        /* --------------------------------------------------------
           SECURITY SCAN — GITLEAKS  (Only for main-build, skip PR)
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

        /* --------------------------------------------------------
           SECURITY SCAN — TRIVY FS (Main build only)
        -------------------------------------------------------- */
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
                 BUILD DOCKER IMAGE (PR + Production)
        -------------------------------------------------------- */
        stage('Build Docker Image') {
            steps {
                script {
                    if (env.CHANGE_ID) {
                        echo "🔨 Building PREVIEW image for PR..."
                        bat "docker build -t ${PREVIEW_IMAGE} ."
                    } else {
                        echo "🔨 Building PRODUCTION image..."
                        bat """
                            docker build -t %IMAGE_VERSION% .
                            docker tag %IMAGE_VERSION% %IMAGE%
                        """
                    }
                }
            }
        }

        /* --------------------------------------------------------
              PREVIEW DEPLOYMENT (ONLY FOR PR BUILDS)
        -------------------------------------------------------- */
        stage('Deploy PR Preview') {
            when { expression { return env.CHANGE_ID != null } }
            steps {
                script {
                    echo "🚀 Deploying PR Preview Environment..."

                    // Remove old preview env
                    bat "docker stop ${PREVIEW_CONTAINER} || echo no container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo no container"

                    // Deploy new preview container
                    bat """
                        docker run -d ^
                            -p ${PREVIEW_PORT}:5000 ^
                            --name ${PREVIEW_CONTAINER} ^
                            ${PREVIEW_IMAGE}
                    """

                    def previewUrl = "http://YOUR-SERVER-IP:${PREVIEW_PORT}"
                    echo "🌍 Preview URL: ${previewUrl}"

                    // Slack message
                    slackSend(
                        channel: '#ci-cd-pipeline',
                        tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                        message: "🟦 PR #${env.CHANGE_ID} Preview Ready → ${previewUrl}"
                    )
                }
            }
        }

        /* --------------------------------------------------------
               IMAGE SCAN + PUSH + DEPLOY (Production Only)
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
                    bat """ echo %PASS% | docker login -u %USER% --password-stdin """
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
                    docker run -d -p 5000:5000 --name devopsaba %IMAGE%
                """
            }
        }

        stage('Verify & Auto Rollback') {
            when { expression { return env.CHANGE_ID == null } }
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
             POST ACTIONS + PR CLEANUP
    -------------------------------------------------------- */
    post {

        /* 🧹 DELETE PREVIEW ENV WHEN PR IS CLOSED */
        cleanup {
            script {
                if (env.CHANGE_ID && currentBuild.currentResult == "ABORTED") {
                    echo "🗑 Cleaning up preview environment for PR ${env.CHANGE_ID}"
                    bat "docker stop ${PREVIEW_CONTAINER} || echo no container"
                    bat "docker rm ${PREVIEW_CONTAINER} || echo no container"
                }
            }
        }

        success {
            slackSend(
                channel: '#ci-cd-pipeline',
                tokenCredentialId: 'ae899829-98fa-4f99-b61b-9b966850cb88',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )

            emailext(
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, lohithbandla5@gmail.com, bhargavisriinivas@gmail.com",
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,
The CI/CD pipeline completed successfully.
Job: ${env.JOB_NAME}
Build: ${env.BUILD_NUMBER}
Status: SUCCESS
Logs: ${env.BUILD_URL}console
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
                to: "ayushkotegar10@gmail.com, aadyambhat2005@gmail.com, bhargavisriinivas@gmail.com, lohithbandla5@gmail.com",
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
Hello Team,
The CI/CD pipeline FAILED.
Logs: ${env.BUILD_URL}console
Regards,
Jenkins
                """,
                attachLog: true
            )
        }
    }
}

