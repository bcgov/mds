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
                //Clear Gradle Cache
                sh 'rm -rf $HOME/.gradle/caches/'
                echo "Building ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-build -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
        stage('Test and Deploy to Dev') {
            parallel {
                stage('Quality Control') {
                    agent { label 'master' }
                    steps {
                        echo "Quality Control ..."
                        sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-unit-test -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
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
             }
        }
        stage ('ZAP (DEV)'){
            agent { label 'master' }
            steps{
                echo "ZAP (DEV) ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-zap -Pargs.--config=pipeline/config.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Test (DEV)') {
            agent { label 'master' }
            steps {
                echo "Test (DEV) ..."
            }
        }
        stage('Deploy (TEST)') {
            agent { label 'master' }
            steps {
                echo "Deploy (TEST)"
            }
        }
        stage('Test (TEST)') {
            agent { label 'master' }
            steps {
                echo "Test (TEST) ..."
            }
        }
        stage('Deploy (PROD)') {
            agent { label 'master' }
            steps {
                echo "Deploy (PROD)"
            }
        }
        stage('Verify (PROD)') {
            agent { label 'master' }
            steps {
                echo "Verify (PROD) ..."
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