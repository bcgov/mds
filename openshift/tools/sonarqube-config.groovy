
app {
    name = 'sonarqube'
    namespaces { //can't call environments :(
        'build'{
            namespace = 'empr-mds-tools'
            disposable = true
        }
        'dev' {
            namespace = app.namespaces.'build'.namespace
            disposable = false
        }
    }

    git {
        workDir = ['git', 'rev-parse', '--show-toplevel'].execute().text.trim()
        uri = ['git', 'config', '--get', 'remote.origin.url'].execute().text.trim()
        ref = ['bash','-c', 'git config branch.`git name-rev --name-only HEAD`.merge'].execute().text.trim()
        commit = ['git', 'rev-parse', 'HEAD'].execute().text.trim()
    }

    build {
        env {
            name = "build"
            id = "pr-1"
        }
        id = "${app.name}"
        version = "v1"
        name = "${app.name}" //

        namespace = app.namespaces.'build'.namespace
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/tools/sonarqube.bc.json',
                    'params':[
                        'NAME': "${app.build.name}",
                        'NAME_SUFFIX': "",
                        'VERSION': app.build.version
                    ]
                ],
                [
                    'file':'openshift/tools/postgresql.bc.json',
                    'params':[
                        'NAME': "${app.build.name}-postgresql",
                        'VERSION': app.build.version
                    ]
                ]
        ]
    }

    deployment {
        env {
            name = vars.deployment.env.name // env-name
            id = vars.deployment.env.id
        }
        id = "${app.name}" // app (unique name across all deployments int he namespace)
        version = "v1" //app-version  and tag
        name = "${app.name}" //app-name   (same name accross all deployments)

        namespace = "${vars.deployment.namespace}"
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/postgresql.dc.json',
                    'params':[
                        'NAME':"${app.deployment.name}-postgresql",
                        'DATABASE_SERVICE_NAME':"${app.deployment.name}-postgresql",
                        'IMAGE_STREAM_NAMESPACE':'',
                        'IMAGE_STREAM_NAME':"${app.build.name}-postgresql",
                        'IMAGE_STREAM_VERSION':"${app.build.version}",
                        'POSTGRESQL_DATABASE':app.name,
                        'VOLUME_CAPACITY':"5Gi"
                    ]
                ],
                [
                    'file':'openshift/tools/sonarqube.dc.json',
                    'params':[
                        'NAME':app.deployment.name,
                        'DATABASE_SERVICE_NAME':"${app.deployment.name}-postgresql",
                        'DATABASE_NAME':app.name,
                        'VERSION': app.deployment.version
                    ]
                ]
        ]
    }
}

environments {
    'dev' {
        vars {
            deployment {
                env {
                    name ="dev"
                    id = "pr-1"
                }
                id = "${app.name}-dev"
                name = "${app.name}"
                namespace = app.namespaces[env.name].namespace
            }
        }
    }
}