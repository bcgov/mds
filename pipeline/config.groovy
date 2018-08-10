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
                    'file':'openshift/bddstack.bc.json',
                    'params':[
                            'NAME':"bdd-stack",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "functional-tests",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                        'file':'openshift/_nodejs.bc.json',
                        'params':[
                            'NAME':"mds-frontend",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "frontend",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}",
                            'NODE_ENV': "production"
                        ]
                ],
                [
                    'file':'openshift/postgresql.bc.json',
                    'params':[
                        'NAME':"mds-postgresql",
                        'SUFFIX': "${app.build.suffix}",
                        'TAG_NAME':"${app.build.version}"
                    ]
                ],
                [
                    'file':'openshift/flyway.bc.json',
                    'params':[
                            'NAME':"mds-flyway-migration",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "migrations",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
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

        namespace = "${vars.deployment.namespace}"
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/postgresql.dc.json',
                    'params':[
                            'NAME':"mds-postgresql",
                            'DATABASE_SERVICE_NAME':"mds-postgresql${vars.deployment.suffix}",
                            'IMAGE_STREAM_NAMESPACE':'',
                            'IMAGE_STREAM_NAME':"mds-postgresql",
                            'IMAGE_STREAM_VERSION':"${app.deployment.version}",
                            'POSTGRESQL_DATABASE':'mds',
                            'VOLUME_CAPACITY':"${vars.DB_PVC_SIZE}"
                    ]
                ],
                [
                    'file':'openshift/_nodejs.dc.json',
                    'params':[
                            'NAME':"mds-frontend",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'TAG_NAME':"${app.deployment.version}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-frontend'.HOST}",
                            'NODE_ENV': "production",
                            'API_URL': "https://${vars.modules.'mds-python-backend'.HOST}"
                    ]
                ],
                [
                    'file':'openshift/_python36.dc.json',
                    'params':[
                            'NAME':"mds-python-backend",
                            'FLYWAY_NAME':"mds-flyway-migration-${app.git.changeId}-client",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'HOST': "${vars.modules.'mds-python-backend'.HOST}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}"
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
                suffix = "-pr-${vars.git.changeId}"
            }
            modules {
                'mds-frontend' {
                    HOST = "mds-frontend-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'mds-python-backend' {
                    HOST = "mds-python-backend-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'bdd-stack' {
                    HOST = "bdd-stack-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }


    'test' {
        vars {
            DB_PVC_SIZE = '1Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            deployment {
                env {
                    name = "test"
                }
                key = 'test'
                namespace = 'empr-mds-test'
                suffix = "-test"
            }
            modules {
                'mds-frontend' {
                    HOST = "mds-frontend-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'mds-python-backend' {
                    HOST = "mds-python-backend-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'bdd-stack' {
                    HOST = "bdd-stack-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
    'prod' {
        vars {
            DB_PVC_SIZE = '10Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            deployment {
                env {
                    name = "prod"
                }
                suffix = "-prod"
                key = 'prod'
                namespace = 'empr-mds-prod'
            }
            modules {
                'mds-frontend' {
                    HOST = "mds-frontend-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'mds-python-backend' {
                    HOST = "mds-python-backend-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'bdd-stack' {
                    HOST = "bdd-stack-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
}