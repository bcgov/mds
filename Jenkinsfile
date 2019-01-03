pipeline {
    agent none
    options {
        disableResume()
    }
    stages {
        stage('Merge to master') {
            agent { label 'master' }
            steps {
                script {
                    def IS_APPROVED = input(message: "Merge to master?", ok: "yes", parameters: [string(name: 'IS_APPROVED', defaultValue: 'yes', description: 'Merge to master?')])
                    if (IS_APPROVED != 'yes') {
                        currentBuild.result = "ABORTED"
                        error "User cancelled"
                    }
                    echo "Merge to master"
                    sh 'git status'
                }
            }
        }
    }
}