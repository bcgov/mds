app {
    name = 'mds'
    version = 'snapshot'

    namespaces {
        'build'{
            namespace = 'empr-mds-tools'
            disposable = true
        }
        'dev' {
            namespace = 'empr-mds-dev'
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
                    'file':'openshift/templates/postgresql.dc.json',
                    'params':[
                            'NAME':"mds-postgresql",
                            'SUFFIX':"${vars.deployment.suffix}",
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
                /*[
                    'file':'openshift/templates/postgresql.dc.json',
                    'params':[
                            'NAME':"mds-postgresql",
                            'SUFFIX':"${vars.deployment.suffix}-reporting",
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
                ],*/
                /*[
                    'file':'openshift/templates/dbbackup.dc.json',
                    'params':[
                            'NAME':"mds-database-backup",
                            'FLYWAY_NAME':"mds-flyway-migration-client",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'ENVIRONMENT_NAME':"${vars.deployment.namespace}",
                            'ENVIRONMENT_FRIENDLY_NAME':"BC Mines Digital Services (DEV)",
                            'DATABASE_SERVICE_NAME':"mds-postgresql${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.backup.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.backup.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.backup.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.backup.memory_limit}",
                            'VERIFICATION_VOLUME_SIZE':"${vars.BACKUP_VERIFICATION_PVC_SIZE}",
                            'DB_NRIS_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}-nris"
                    ]
                ],*/
                [
                    'file':'openshift/templates/redis.dc.json',
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
                    'file':'openshift/templates/_nodejs.dc.json',
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
                            'FN_LAYER_URL': "${vars.deployment.fn_layer_url}",
                            'KEYCLOAK_RESOURCE': "${vars.keycloak.resource}",
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId_core}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint_core}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api",
                            'DOCUMENT_MANAGER_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/document-manager"
                    ]
                ],
                [
                    'file':'openshift/templates/_nodejs.dc.json',
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
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId_minespace}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint_minespace}",
                            'SITEMINDER_URL': "${vars.keycloak.siteminder_url}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api",
                            'DOCUMENT_MANAGER_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/document-manager"

                    ]
                ],
                [
                    'file':'openshift/templates/_nginx.dc.json',
                    'params':[
                            'NAME':"mds-nginx",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'LOG_PVC_SIZE':"${vars.LOG_PVC_SIZE}",
                            'CPU_REQUEST':"${vars.resources.nginx.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.nginx.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.nginx.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.nginx.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.nginx.replica_min}",
                            'REPLICA_MAX':"${vars.resources.nginx.replica_max}",
                            'CORE_DOMAIN': "${vars.modules.'mds-nginx'.HOST_CORE}",
                            'MINESPACE_DOMAIN': "${vars.modules.'mds-nginx'.HOST_MINESPACE}",
                            'ROUTE': "${vars.modules.'mds-nginx'.ROUTE}",
                            'PATH_PREFIX': "${vars.modules.'mds-nginx'.PATH}",
                            'CORE_SERVICE_URL': "${vars.modules.'mds-frontend'.HOST}",
                            'NRIS_API_SERVICE_URL': "${vars.modules.'mds-nris-backend'.HOST}",
                            'DOCUMENT_MANAGER_SERVICE_URL': "${vars.modules.'mds-docman-backend'.HOST}",
                            'MINESPACE_SERVICE_URL': "${vars.modules.'mds-frontend-public'.HOST}",
                            'API_SERVICE_URL': "${vars.modules.'mds-python-backend'.HOST}",
                    ]
                ],
                [
                    'file':'openshift/templates/_python36.dc.json',
                    'params':[
                            'NAME':"mds-python-backend",
                            'FLYWAY_NAME':"mds-flyway-migration-client",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.python.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.python.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.python.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.python.memory_limit}",
                            'UWSGI_THREADS':"${vars.resources.python.uwsgi_threads}",
                            'UWSGI_PROCESSES':"${vars.resources.python.uwsgi_processes}",
                            'REPLICA_MIN':"${vars.resources.python.replica_min}",
                            'REPLICA_MAX':"${vars.resources.python.replica_max}",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId_core}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-python-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-python-backend'.PATH}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}",
                            'DB_NRIS_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}-nris",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled_core}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api",
                            'NRIS_API_URL': "${vars.modules.'mds-nris-backend'.HOST}${vars.modules.'mds-nris-backend'.PATH}",
                            'DOCUMENT_MANAGER_URL': "${vars.modules.'mds-docman-backend'.HOST}${vars.modules.'mds-docman-backend'.PATH}",
                            'DOCUMENT_GENERATOR_URL': "${vars.modules.'mds-docgen-api'.HOST}",
                    ]
                ],
                [
                    'file':'openshift/templates/document-manager/docman.dc.json',
                    'params':[
                            'NAME':"mds-docman-backend",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.python_lite.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.python_lite.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.python_lite.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.python_lite.memory_limit}",
                            'UWSGI_THREADS':"${vars.resources.python_lite.uwsgi_threads}",
                            'UWSGI_PROCESSES':"${vars.resources.python_lite.uwsgi_processes}",
                            'REPLICA_MIN':"${vars.resources.python_lite.replica_min}",
                            'REPLICA_MAX':"${vars.resources.python_lite.replica_max}",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId_core}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-python-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-docman-backend'.PATH}",
                            'DB_HOST': "mds-postgresql${vars.deployment.suffix}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled_core}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name_docman}",
                            'DOCUMENT_CAPACITY':"${vars.DOCUMENT_PVC_SIZE}",
                            'DOCUMENT_CAPACITY_LOWER':"${vars.DOCUMENT_PVC_SIZE.toString().toLowerCase()}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/document-manager",
                    ]
                ],
                [
                    'file':'openshift/templates/nris-api/_python36_oracle.dc.json',
                    'params':[
                            'NAME':"mds-nris-backend",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.python_lite.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.python_lite.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.python_lite.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.python_lite.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.python_lite.replica_min}",
                            'REPLICA_MAX':"${vars.resources.python_lite.replica_max}",
                            'UWSGI_THREADS':"${vars.resources.python_lite.uwsgi_threads}",
                            'UWSGI_PROCESSES':"${vars.resources.python_lite.uwsgi_processes}",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId_core}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-nris-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-nris-backend'.PATH}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}-nris",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'DB_HOST': "mds-postgresql${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled_nris}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name_nris}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/nris_api",
                    ]
                ],
                [
                    'file':'openshift/templates/docgen/docgen.dc.json',
                    'params':[
                            'NAME':"docgen",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'APPLICATION_SUFFIX': "${vars.deployment.application_suffix}",
                            'PORT':3030,
                            'CPU_REQUEST':"${vars.resources.docgen.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.docgen.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.docgen.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.docgen.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.docgen.replica_min}",
                            'REPLICA_MAX':"${vars.resources.docgen.replica_max}",
                            'BASE_PATH': "${vars.modules.'mds-docgen-api'.PATH}",
                            'NODE_ENV': "${vars.deployment.node_env}"
                    ]
                ],
                // [
                //     'file':'openshift/templates/digdag/digdag.dc.json',
                //     'params':[
                //             'NAME':"digdag",
                //             'VERSION':"${app.deployment.version}",
                //             'NAMESPACE':"${vars.deployment.namespace}",
                //             'SUFFIX': "${vars.deployment.suffix}",
                //             'SCHEDULER_PVC_SIZE':"200Mi",
                //             'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                //             'KEYCLOAK_DISCOVERY_URL':"${vars.keycloak.known_config_url}",
                //             'APPLICATION_DOMAIN': "${vars.modules.'digdag'.HOST}",
                //             'CPU_REQUEST':"${vars.resources.digdag.cpu_request}",
                //             'CPU_LIMIT':"${vars.resources.digdag.cpu_limit}",
                //             'MEMORY_REQUEST':"${vars.resources.digdag.memory_request}",
                //             'MEMORY_LIMIT':"${vars.resources.digdag.memory_limit}"
                //     ]
                // ]
        ]
    }
}

environments {
    'dev' {
        vars {
            DB_PVC_SIZE = '5Gi'
            DOCUMENT_PVC_SIZE = '1Gi'
            BACKUP_VERIFICATION_PVC_SIZE = '200Mi'
            LOG_PVC_SIZE = '1Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            keycloak {
                clientId_core = "mines-application-dev"
                clientId_minespace = "minespace-dev"
                resource = "mines-application-dev"
                idpHint_core = "dev"
                idpHint_minespace = "dev"
                url = "https://sso-test.pathfinder.gov.bc.ca/auth"
                known_config_url = "https://sso-test.pathfinder.gov.bc.ca/auth/realms/mds/.well-known/openid-configuration"
                siteminder_url = "https://logontest.gov.bc.ca"
            }
            resources {
                node {
                    cpu_request = "10m"
                    cpu_limit = "30m"
                    memory_request = "64Mi"
                    memory_limit = "256Mi"
                    replica_min = 1
                    replica_max = 1
                }
                docgen {
                    cpu_request = "50m"
                    cpu_limit = "200m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                    replica_min = 1
                    replica_max = 1
                }
                nginx {
                    cpu_request = "10m"
                    cpu_limit = "20m"
                    memory_request = "64Mi"
                    memory_limit = "104Mi"
                    replica_min = 1
                    replica_max = 1
                }
                python {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    uwsgi_threads = 4
                    uwsgi_processes = 2
                    replica_min = 1
                    replica_max = 1
                }
                python_lite {
                    cpu_request = "10m"
                    cpu_limit = "100m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                    uwsgi_threads = 2
                    uwsgi_processes = 1
                    replica_min = 1
                    replica_max = 1
                }
                postgres {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
                }
                redis {
                    cpu_request = "10m"
                    cpu_limit = "20m"
                    memory_request = "16Mi"
                    memory_limit = "32Mi"
                }
                /*
                backup {
                    cpu_request = "0"
                    cpu_limit = "0"
                    memory_request = "0"
                    memory_limit = "0"
                }*/
                // digdag {
                //     cpu_request = "100m"
                //     cpu_limit = "200m"
                //     memory_request = "512Mi"
                //     memory_limit = "1Gi"
                // }
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
                fn_layer_url = "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov"
                elastic_enabled_core = 0
                elastic_enabled_nris = 0
                elastic_service_name = "MDS Dev"
                elastic_service_name_nris = "NRIS API Dev"
                elastic_service_name_docman = 'DocMan Dev'
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
                    HOST_CORE = "minesdigitalservices-${vars.deployment.key}.pathfinder.gov.bc.ca"
                    HOST_MINESPACE = "minespace-${vars.deployment.key}.pathfinder.gov.bc.ca"
                    PATH = "/${vars.git.changeId}"
                    ROUTE = "/${vars.git.changeId}"
                }
                'mds-python-backend' {
                    HOST = "http://mds-python-backend${vars.deployment.suffix}:5000"
                    PATH = "/${vars.git.changeId}/api"
                }
                'mds-nris-backend' {
                    HOST = "http://mds-nris-backend${vars.deployment.suffix}:5500"
                    PATH = "/${vars.git.changeId}/nris-api"
                }
                'mds-docman-backend' {
                    HOST = "http://mds-docman-backend${vars.deployment.suffix}:5001"
                    PATH = "/${vars.git.changeId}/document-manager"
                }
                'mds-redis' {
                    HOST = "http://mds-redis${vars.deployment.suffix}"
                }
                'mds-docgen-api' {
                    HOST = "http://docgen${vars.deployment.suffix}:3030"
                }
                // 'digdag' {
                //     HOST = "mds-digdag-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                // }
            }
        }
    }
}
