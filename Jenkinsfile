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
                    repo = bcgov.GitHubHelper.getGitHubRepository("https://github.com/bcgov/mds")
                    mergeMethod = bcgov.GitHubHelper.GHPullRequest.MergeMethod.MERGE
                    pullRequest = repo.getPullRequest(360)
                    mergeable = pullRequest.getMergeable()
                    head = pullRequest.getHead()
                    println repo, mergeMethod, pullRequest, mergeable, head
                }
            }
        }
    }
}