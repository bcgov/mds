pipeline {
    agent none
    options {
        disableResume()
    }
    stages {
                stage('HACK') {
            agent { label 'master' }
            steps {
                echo "Hacking MDS ..."
            }
        }
        stage('Build') {
            agent { label 'master' }
            steps {
                echo "Aborting all running jobs ..."
                script {
                    abortAllPreviousBuildInProgress(currentBuild)
                }
                echo "Building ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-build -Pargs.--config=pipeline/config-build.groovy -Pargs.--pr=${CHANGE_ID}'
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
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-clean -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
    }
}
