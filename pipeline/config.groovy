app {
    name = 'mds'
    version = 'snapshot'
    namespaces { //can't call environments :(
        'build'{
            namespace = 'empr-mds-tools'
            disposable = true
        }
        'dev' {
            namespace = 'empr-mds-dev'
            disposable = true
        }
        'test' {
            namespace = 'empr-mds-test'
            disposable = false
        }
        'prod' {
            namespace = 'empr-mds-prod'
            disposable = false
        }
    }

    git {
        workDir = ['git', 'rev-parse', '--show-toplevel'].execute().text.trim()
        uri = ['git', 'config', '--get', 'remote.origin.url'].execute().text.trim()
        commit = ['git', 'rev-parse', 'HEAD'].execute().text.trim()
        //ref = opt.'branch'?:['bash','-c', 'git config branch.`git name-rev --name-only HEAD`.merge'].execute().text.trim()
        changeId = "${opt.'pr'}"
        ref = opt.'branch'?:"refs/pull/${git.changeId}/head"
        github {
            owner = app.git.uri.tokenize('/')[2]
            name = app.git.uri.tokenize('/')[3].tokenize('.git')[0]
        }
    }

    build {
        env {
            name = 'build'
            id = "pr-${app.git.changeId}"
        }
        id = "${app.name}-${app.build.env.name}-${app.build.env.id}"
        name = "${app.name}"
        version = "${app.build.env.name}-${app.build.env.id}"

        suffix = "-${app.git.changeId}"
        namespace = 'empr-mds-tools'
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/_python36.bc.json',
                    'params':[
                            'NAME':"mds-python-backend",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "python-backend",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/_nodejs.bc.json',
                    'params':[
                        'NAME':"mds-frontend",
                        'SUFFIX': "${app.build.suffix}",
                        'OUTPUT_TAG_NAME':"${app.build.version}",
                        'SOURCE_CONTEXT_DIR': "frontend",
                        'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/postgresql.bc.json',
                    'params':[
                        'NAME':"mds-postgresql",
                        'SUFFIX': "${app.build.suffix}",
                        'TAG_NAME':"${app.build.version}"
                    ]
                ]
        ]
    }

    deployment {
        env {
            name = vars.deployment.env.name // env-name
            id = "pr-${app.git.changeId}"
        }

        id = "${app.name}-${app.deployment.env.name}-${app.deployment.env.id}"
        name = "${app.name}"
        version = "${app.deployment.env.name}-${app.deployment.env.id}"

        suffix = "-pr-${app.git.changeId}"
        namespace = "${vars.deployment.namespace}"
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/_python36.dc.json',
                    'params':[
                            'NAME':"mds-python-backend",
                            'SUFFIX': "${app.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'HOST': "${vars.modules.'mds-python-backend'.HOST}",
                            'DB_CONFIG_NAME': "mds-postgresql${app.deployment.suffix}"
                    ]
                ],
                [
                    'file':'openshift/_nodejs.dc.json',
                    'params':[
                        'NAME':"mds-frontend",
                        'SUFFIX': "${app.deployment.suffix}",
                        'TAG_NAME':"${app.deployment.version}",
                        'APPLICATION_DOMAIN': "${vars.modules.'mds-frontend'.HOST}"
                    ]
                ],
                [
                    'file':'openshift/postgresql.dc.json',
                    'params':[
                        'NAME':"mds-postgresql",
                        'DATABASE_SERVICE_NAME':"mds-postgresql${app.deployment.suffix}",
                        'IMAGE_STREAM_NAMESPACE':'',
                        'IMAGE_STREAM_NAME':"mds-postgresql",
                        'IMAGE_STREAM_VERSION':"${app.deployment.version}",
                        'POSTGRESQL_DATABASE':'mds',
                        'VOLUME_CAPACITY':"${vars.DB_PVC_SIZE}"
                    ]
                ]
        ]
    }
}

//Default Values (Should it default to DEV or PROD???)
vars {
    DB_PVC_SIZE = '1Gi'
    modules {

    }
}

environments {
    'dev' {
        vars {
            DB_PVC_SIZE = '1Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            deployment {
                env {
                    name = "dev"
                }
                key = 'dev'
                namespace = 'empr-mds-dev'
            }
            modules {
                'mds-frontend' {
                    HOST = "mds-frontend-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'mds-python-backend' {
                    HOST = "mds-python-backend-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
    'test' {
        vars {
            deployment {
                key = 'test'
                namespace = 'empr-mds-test'
            }
        }
    }
    'prod' {
        vars {
            deployment {
                key = 'prod'
                namespace = 'empr-mds-prod'
            }
        }
    }
}