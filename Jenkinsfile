pipeline {
    agent none
    options {
        disableResume()
    }
    stages {
        stage('Verify-Files') {
            agent { label 'master' }
            steps {
                echo "Aborting all running jobs ..."
                script {
                    // Kill any running jobs
                    abortAllPreviousBuildInProgress(currentBuild)

                    // Grab any files under the pipeline directory
                    // Verify they match the trusted version
                    files = findFiles(glob: 'pipeline/**')
                    for (def file : files) {
                        readTrusted file.path
                    }
                }
            }
        }
        stage('Build') {
            agent { label 'master' }
            steps {
                echo "Building ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-build -Pargs.--config=pipeline/config-build.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
        stage('Deploy (DEV)') {
            agent { label 'master' }
            steps {
                echo "Deploy (DEV) ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Unit Tests and SonarQube Reporting (DEV)') {
            agent { label 'master' }
            steps {
                echo "Running unit tests and reporting them to SonarQube ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-unit-test -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev -Pargs.--branch=${CHANGE_BRANCH}'
            }
        }
        stage('Functional Test (DEV)') {
            agent { label 'master' }
            steps {
                echo "Functional Test (DEV) ..."
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-functional-test -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage ('ZAP (DEV)'){
            agent { label 'master' }
            steps {
                echo "ZAP (DEV)"
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-zap -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=dev'
            }
        }
        stage('Deploy (TEST)') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                echo "Deploy (TEST)"
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config-test.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=test'
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
                    sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-deploy -Pargs.--config=pipeline/config-prod.groovy -Pargs.--pr=${CHANGE_ID} -Pargs.--env=prod'
                }
            }
        }
        stage('Merge to master') {
            agent { label 'master' }
            when {
              environment name: 'CHANGE_TARGET', value: 'master'
            }
            steps {
                script {
                    def IS_APPROVED = input(message: "Merge to master?", ok: "yes", parameters: [string(name: 'IS_APPROVED', defaultValue: 'yes', description: 'Merge to master?')])
                    if (IS_APPROVED != 'yes') {
                        currentBuild.result = "ABORTED"
                        error "User cancelled"
                    }
                    echo "Squashing commits and merging to master"
                }
                withCredentials([usernamePassword(credentialsId: 'github-account', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
                    sh """
                        # Update master with latest changes from develop
                        git checkout master
                        git fetch
                        git merge --squash origin/develop
                        git commit -m "Merge branch develop into master"
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/bcgov/mds.git

                        # Update the HEAD on develop to be the same as master
                        git checkout develop
                        git fetch
                        git merge -s ours -m "Updating develop with master" origin/master
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/bcgov/mds.git
                    """
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
                sh 'unset JAVA_OPTS; pipeline/gradlew --no-build-cache --console=plain --no-daemon -b pipeline/build.gradle cd-clean -Pargs.--config=pipeline/config-dev.groovy -Pargs.--pr=${CHANGE_ID}'
            }
        }
    }
}