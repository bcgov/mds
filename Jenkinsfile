pipeline {
    agent none
    options {
        disableResume()
    }
    stages {
        stage('Build') {
            agent { label 'master' }
            steps {
                echo "Aborting all running jobs ..."
                script {
                    abortAllPreviousBuildInProgress(currentBuild)
                }
                echo "Building ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-build -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
        stage('Deploy (DEV)') {
            agent { label 'master' }
            steps {
                echo "Deploy (DEV) ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Unit Tests and SonarQube Reporting (DEV)') {
            agent { label 'master' }
            steps {
                echo "Running unit tests and reporting them to SonarQube ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-unit-test -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev -Pargs.--branch=${GIT_BRANCH}'
            }
        }
        stage ('ZAP (DEV)'){
            agent { label 'master' }
            steps {
                echo "ZAP (DEV)"
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-zap -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Deploy (TEST)') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                echo "Deploy (TEST)"
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=test'
            }
        }
        stage('Functional Test (TEST)') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                echo "Functional Test (DEV) ..."
                //sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-functional-test -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=test'
            }
        }
        stage('Deploy (PROD)') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                script {
                    def IS_APPROVED = input(message: "Deploy to PROD?", ok: "yes", parameters: [string(name: 'IS_APPROVED', defaultValue: 'yes', description: 'Deploy to PROD?')])
                    if (IS_APPROVED != 'yes') {
                        currentBuild.result = "ABORTED"
                        error "User cancelled"
                    }
                    echo "Deploy (PROD)"
                    sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=prod'
                }
            }
        }
        stage('Acceptance') {
            agent { label 'master' }
            input {
                message "Should we continue with cleanup?"
                ok "Yes!"
            }
            steps {
                echo "Acceptance ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-clean -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
    }
}