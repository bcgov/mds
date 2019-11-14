app {
    name = 'mds'
    version = 'snapshot'
        namespaces {
        'build'{
            namespace = 'empr-mds-tools'
            disposable = true
        }
    }

    git {
        workDir = ['git', 'rev-parse', '--show-toplevel'].execute().text.trim()
        uri = ['git', 'config', '--get', 'remote.origin.url'].execute().text.trim()
        commit = ['git', 'rev-parse', 'HEAD'].execute().text.trim()
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
        timeoutInSeconds = 60*40 // 40 minutes
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
                    'file':'microservices/document_manager/openshift/_python36_docman.bc.json',
                    'params':[
                            'NAME':"mds-docman-backend",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "microservices/document_manager/backend",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'microservices/now_etls/python36.bc.json',
                    'params':[
                            'NAME':"mds-now-etl",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "microservices/now_etls",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'microservices/nris_api/openshift/_python36_oracle.bc.json',
                    'params':[
                            'NAME':"mds-nris-backend",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "microservices/nris_api/backend",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}",
                    ]
                ],
                [
                    'file':'openshift/_nginx.bc.json',
                    'params':[
                            'NAME':"mds-nginx",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "nginx",
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
                            'APPLICATION_SUFFIX': "-${app.build.env.id}",
                            'BASE_PATH': "/${app.git.changeId}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "frontend",
                            'DOCKER_IMAGE_DIRECTORY': "docker-images/nodejs-10",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}",
                            'NODE_ENV': "production"
                        ]
                ],
                [
                        'file':'openshift/_nodejs.bc.json',
                        'params':[
                            'NAME':"mds-frontend-public",
                            'SUFFIX': "${app.build.suffix}",
                            'APPLICATION_SUFFIX': "-${app.build.env.id}",
                            'BASE_PATH': "/${app.git.changeId}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "frontend-public",
                            'DOCKER_IMAGE_DIRECTORY': "docker-images/nodejs-10-public",
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
                    'file':'openshift/dbbackup.bc.json',
                    'params':[
                        'NAME':"mds-database-backup",
                        'SUFFIX': "${app.build.suffix}",
                        'VERSION':"${app.build.version}"
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
                ],
                [
                    'file':'openshift/tools/schemaspy.bc.json',
                    'params':[
                            'NAME':"schemaspy",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "docker-images/schemaspy",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/tools/metabase.bc.json',
                    'params':[
                            'NAME':"metabase",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "docker-images/metabase",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'tools/openshift/digdag.bc.json',
                    'params':[
                            'NAME':"digdag",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "tools/digdag",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/tools/logstash.bc.json',
                    'params':[
                            'NAME':"mds-logstash",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "elastic/logstash",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ]
        ]
    }
}