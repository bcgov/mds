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
                            'DOCKER_IMAGE_DIRECTORY': "docker-images/nodejs-8",
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
                            'DOCKER_IMAGE_DIRECTORY': "docker-images/nodejs-8-public",
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
                            'CPU_REQUEST':"${vars.resources.postgres.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.postgres.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.postgres.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.postgres.memory_limit}",
                            'IMAGE_STREAM_NAMESPACE':'',
                            'IMAGE_STREAM_NAME':"mds-postgresql",
                            'IMAGE_STREAM_VERSION':"${app.deployment.version}",
                            'POSTGRESQL_DATABASE':'mds',
                            'VOLUME_CAPACITY':"${vars.DB_PVC_SIZE}"
                    ]
                ],
                [
                    'file':'openshift/dbbackup.dc.json',
                    'params':[
                            'NAME':"mds-database-backup",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'DATABASE_SERVICE_NAME':"mds-postgresql${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.backup.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.backup.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.backup.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.backup.memory_limit}",
                            'PERSISTENT_VOLUME_SIZE':"${vars.BACKUP_PVC_SIZE}"
                    ]
                ],
                [
                    'file':'openshift/redis.dc.json',
                    'params':[
                            'NAME':"mds-redis",
                            'DATABASE_SERVICE_NAME':"mds-redis${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.redis.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.redis.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.redis.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.redis.memory_limit}",
                            'REDIS_VERSION':"3.2"
                    ]
                ],
                [
                    'file':'openshift/_nodejs.dc.json',
                    'params':[
                            'NAME':"mds-frontend",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'APPLICATION_SUFFIX': "${vars.deployment.application_suffix}",
                            'TAG_NAME':"${app.deployment.version}",
                            'PORT':3000,
                            'CPU_REQUEST':"${vars.resources.node.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.node.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.node.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.node.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.node.replica_min}",
                            'REPLICA_MAX':"${vars.resources.node.replica_max}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-frontend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-frontend'.PATH}",
                            'NODE_ENV': "${vars.deployment.node_env}",
                            'MAP_PORTAL_ID': "${vars.deployment.map_portal_id}",
                            'KEYCLOAK_RESOURCE': "${vars.keycloak.resource}",
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST}${vars.modules.'mds-nginx'.PATH}/api"
                    ]
                ],
                [
                    'file':'openshift/_nodejs.dc.json',
                    'params':[
                            'NAME':"mds-frontend-public",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'APPLICATION_SUFFIX': "${vars.deployment.application_suffix}",
                            'TAG_NAME':"${app.deployment.version}",
                            'PORT':3020,
                            'CPU_REQUEST':"${vars.resources.node.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.node.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.node.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.node.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.node.replica_min}",
                            'REPLICA_MAX':"${vars.resources.node.replica_max}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-frontend-public'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-frontend-public'.PATH}",
                            'NODE_ENV': "${vars.deployment.node_env}",
                            'KEYCLOAK_RESOURCE': "${vars.keycloak.resource}",
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint}",
                            'SITEMINDER_URL': "${vars.keycloak.siteminder_url}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST}${vars.modules.'mds-nginx'.PATH}/api"

                    ]
                ],
                [
                    'file':'openshift/_nginx.dc.json',
                    'params':[
                            'NAME':"mds-nginx",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.nginx.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.nginx.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.nginx.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.nginx.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.nginx.replica_min}",
                            'REPLICA_MAX':"${vars.resources.nginx.replica_max}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-nginx'.HOST}",
                            'ROUTE': "${vars.modules.'mds-nginx'.ROUTE}",
                            'PATH_PREFIX': "${vars.modules.'mds-nginx'.PATH}",
                            'FRONTEND_SERVICE_URL': "${vars.modules.'mds-frontend'.HOST}",
                            'FRONTEND_PUBLIC_SERVICE_URL': "${vars.modules.'mds-frontend-public'.HOST}",
                            'API_SERVICE_URL': "${vars.modules.'mds-python-backend'.HOST}",
                    ]
                ],
                [
                    'file':'openshift/_python36.dc.json',
                    'params':[
                            'NAME':"mds-python-backend",
                            'FLYWAY_NAME':"mds-flyway-migration-client",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.python.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.python.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.python.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.python.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.python.replica_min}",
                            'REPLICA_MAX':"${vars.resources.python.replica_max}",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-python-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-python-backend'.PATH}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name}",
                            'DOCUMENT_CAPACITY':"${vars.DOCUMENT_PVC_SIZE}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST}${vars.modules.'mds-nginx'.PATH}/api",
                    ]
                ],
                [
                    'file':'openshift/tools/schemaspy.dc.json',
                    'params':[
                            'NAME':"schemaspy",
                            'VERSION':"${app.deployment.version}",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'BACKEND_HOST': "https://${vars.modules.'mds-nginx'.HOST}${vars.modules.'mds-nginx'.PATH}/api",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId}",
                            'APPLICATION_DOMAIN': "${vars.modules.'schemaspy'.HOST}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}"
                    ]
                ]
        ]
    }
}

environments {
    'dev' {
        vars {
            DB_PVC_SIZE = '1Gi'
            DOCUMENT_PVC_SIZE = '1Gi'
            BACKUP_PVC_SIZE = '1Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            keycloak {
                clientId = "mines-application-dev"
                resource = "mines-application-dev"
                idpHint = "dev"
                url = "https://sso-test.pathfinder.gov.bc.ca/auth"
                known_config_url = "https://sso-test.pathfinder.gov.bc.ca/auth/realms/mds/.well-known/openid-configuration"
                siteminder_url = "https://logontest.gov.bc.ca"
            }
            resources {
                node {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "256Mi"
                    memory_limit = "384Mi"
                    replica_min = 1
                    replica_max = 1
                }
                nginx {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                    replica_min = 1
                    replica_max = 1
                }
                python {
                    cpu_request = "50m"
                    cpu_limit = "150m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    replica_min = 1
                    replica_max = 1
                }
                postgres {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "384Mi"
                    memory_limit = "768Mi"
                }
                redis {
                    cpu_request = "20m"
                    cpu_limit = "50m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                }
                backup {
                    cpu_request = "1m"
                    cpu_limit = "5m"
                    memory_request = "64Mi"
                    memory_limit = "128Mi"
                }
            }
            deployment {
                env {
                    name = "dev"
                }
                key = 'dev'
                namespace = 'empr-mds-dev'
                suffix = "-pr-${vars.git.changeId}"
                application_suffix = "-pr-${vars.git.changeId}"
                node_env = "development"
                map_portal_id = "e926583cd0114cd19ebc591f344e30dc"
                elastic_enabled = 1
                elastic_service_name = "MDS Dev"
            }
            modules {
                'mds-frontend' {
                    HOST = "http://mds-frontend${vars.deployment.suffix}:3000"
                    PATH = "/${vars.git.changeId}"
                }
                'mds-frontend-public' {
                    HOST = "http://mds-frontend-public${vars.deployment.suffix}:3020"
                    PATH = "/${vars.git.changeId}"
                }
                'mds-nginx' {
                    HOST_CORE = "core-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                    HOST_MINESPACE = "minespace-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                    PATH = "/${vars.git.changeId}"
                    ROUTE = "/${vars.git.changeId}"
                }
                'mds-python-backend' {
                    HOST = "http://mds-python-backend${vars.deployment.suffix}:5000"
                    PATH = "/${vars.git.changeId}"
                }
                'mds-redis' {
                    HOST = "http://mds-redis${vars.deployment.suffix}"
                }
                'schemaspy' {
                    HOST = "mds-schemaspy-${vars.git.changeId}-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
    'test' {
        vars {
            DB_PVC_SIZE = '10Gi'
            DOCUMENT_PVC_SIZE = '5Gi'
            BACKUP_PVC_SIZE = '1Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            keycloak {
                clientId = "mines-application-test"
                resource = "mines-application-test"
                idpHint = "idir"
                url = "https://sso-test.pathfinder.gov.bc.ca/auth"
                known_config_url = "https://sso-test.pathfinder.gov.bc.ca/auth/realms/mds/.well-known/openid-configuration"
                siteminder_url = "https://logontest.gov.bc.ca"
            }
            resources {
                node {
                    cpu_request = "100m"
                    cpu_limit = "150m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
                    replica_min = 2
                    replica_max = 4
                }
                nginx {
                    cpu_request = "100m"
                    cpu_limit = "150m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    replica_min = 2
                    replica_max = 4
                }
                python {
                    cpu_request = "200m"
                    cpu_limit = "400m"
                    memory_request = "1.5Gi"
                    memory_limit = "3Gi"
                    replica_min = 2
                    replica_max = 4
                }
                postgres {
                    cpu_request = "200m"
                    cpu_limit = "500m"
                    memory_request = "2.5Gi"
                    memory_limit = "4Gi"
                }
                redis {
                    cpu_request = "100m"
                    cpu_limit = "200m"
                    memory_request = "1Gi"
                    memory_limit = "2Gi"
                }
                backup {
                    cpu_request = "1m"
                    cpu_limit = "5m"
                    memory_request = "64Mi"
                    memory_limit = "128Mi"
                }
            }
            deployment {
                env {
                    name = "test"
                }
                key = 'test'
                namespace = 'empr-mds-test'
                suffix = "-test"
                application_suffix = "-pr-${vars.git.changeId}"
                node_env = "test"
                map_portal_id = "e926583cd0114cd19ebc591f344e30dc"
                elastic_enabled = 1
                elastic_service_name = "MDS Test"
            }
            modules {
                'mds-frontend' {
                    HOST = "http://mds-frontend${vars.deployment.suffix}:3000"
                    PATH = ""
                }
                'mds-frontend-public' {
                    HOST = "http://mds-frontend-public${vars.deployment.suffix}:3020"
                    PATH = "/"
                }
                'mds-nginx' {
                    HOST = "mds-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                    PATH = ""
                    ROUTE = "/"
                }
                'mds-python-backend' {
                    HOST = "http://mds-python-backend${vars.deployment.suffix}:5000"
                    PATH = ""
                }
                'mds-redis' {
                    HOST = "http://mds-redis${vars.deployment.suffix}"
                }
                'schemaspy' {
                    HOST = "mds-schemaspy-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
    'prod' {
        vars {
            DB_PVC_SIZE = '50Gi'
            DOCUMENT_PVC_SIZE = '50Gi'
            BACKUP_PVC_SIZE = '50Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            resources {
                node {
                    cpu_request = "100m"
                    cpu_limit = "150m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
                    replica_min = 2
                    replica_max = 4
                }
                nginx {
                    cpu_request = "100m"
                    cpu_limit = "150m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    replica_min = 2
                    replica_max = 4
                }
                python {
                    cpu_request = "200m"
                    cpu_limit = "400m"
                    memory_request = "1.5Gi"
                    memory_limit = "3Gi"
                    replica_min = 2
                    replica_max = 4
                }
                postgres {
                    cpu_request = "200m"
                    cpu_limit = "500m"
                    memory_request = "2.5Gi"
                    memory_limit = "4Gi"
                }
                redis {
                    cpu_request = "100m"
                    cpu_limit = "200m"
                    memory_request = "1Gi"
                    memory_limit = "2Gi"
                }
                backup {
                    cpu_request = "100m"
                    cpu_limit = "450m"
                    memory_request = "1Gi"
                    memory_limit = "2Gi"
                }
            }
            keycloak {
                clientId = "mines-application-prod"
                resource = "mines-application-prod"
                idpHint = "idir"
                url = "https://sso.pathfinder.gov.bc.ca/auth"
                known_config_url = "https://sso.pathfinder.gov.bc.ca/auth/realms/mds/.well-known/openid-configuration"
                siteminder_url = "https://logon.gov.bc.ca"
            }
            deployment {
                env {
                    name = "prod"
                }
                suffix = "-prod"
                application_suffix = "-pr-${vars.git.changeId}"
                key = 'prod'
                namespace = 'empr-mds-prod'
                node_env = "production"
                map_portal_id = "803130a9bebb4035b3ac671aafab12d7"
                elastic_enabled = 1
                elastic_service_name = "MDS Prod"
            }
            modules {
                'mds-frontend' {
                    HOST = "http://mds-frontend${vars.deployment.suffix}:3000"
                    PATH = ""
                }
                'mds-frontend-public' {
                    HOST = "http://mds-frontend-public${vars.deployment.suffix}:3020"
                    PATH = "/"
                }
                'mds-nginx' {
                    HOST = "mds-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                    PATH = ""
                    ROUTE = "/"
                }
                'mds-python-backend' {
                    HOST = "http://mds-python-backend${vars.deployment.suffix}:5000"
                    PATH = ""
                }
                'mds-redis' {
                    HOST = "http://mds-redis${vars.deployment.suffix}"
                }
                'schemaspy' {
                    HOST = "mds-schemaspy-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
}