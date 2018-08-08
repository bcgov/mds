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
        stage('Unit Tests (DEV)') {
            agent { label 'master' }
            steps {
                echo "Unit Tests ..."
                //sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-unit-test -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Deploy (DEV)') {
            agent { label 'master' }
            /*input {
                message "Should we continue with deployment to DEV?"
                ok "Yes!"
            }*/
            steps {
                echo "Deploy (DEV) ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage ('ZAP (DEV)'){
            agent { label 'master' }
            steps{
                echo "ZAP (DEV) ..."
                //sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-zap -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
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
        stage('SonarQube (TEST)') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                echo "Unit Tests ..."
                //sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-unit-test -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=test'
            }
        }
        stages{
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            stage('Deploy (PROD)') {
                agent { label 'master' }
                input {
                    message "Should we continue with deployment to PROD?"
                    ok "Yes!"
                }
                steps {
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