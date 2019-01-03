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
                    String mergeMethod='merge'
                    echo "Merging (using '${mergeMethod}' method)"
                    println(bcgov.GitHubHelper)
                }
            }
        }
    }
}