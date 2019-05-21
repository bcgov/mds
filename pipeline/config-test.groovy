app {
    name = 'mds'
    version = 'snapshot'
        namespaces {
        'build'{
            namespace = 'empr-mds-tools'
            disposable = true
        }
        'test' {
            namespace = 'empr-mds-test'
            disposable = false
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
        timeoutInSeconds = 60*40
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
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId_core}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint_core}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api"
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
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId_minespace}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint_minespace}",
                            'SITEMINDER_URL': "${vars.keycloak.siteminder_url}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api"

                    ]
                ],
                [
                    'file':'openshift/_nginx.dc.json',
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
                            'MINESPACE_SERVICE_URL': "${vars.modules.'mds-frontend-public'.HOST}",
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
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId_core}",
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-python-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-python-backend'.PATH}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name}",
                            'DOCUMENT_CAPACITY':"${vars.DOCUMENT_PVC_SIZE}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api",
                    ]
                ],
                [
                    'file':'microservices/nris_api/openshift/_python36_oracle.dc.json',
                    'params':[
                            'NAME':"mds-nris-backend",
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
                            'APPLICATION_DOMAIN': "${vars.modules.'mds-nris-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'mds-nris-backend'.PATH}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}-nris",
                            'REDIS_CONFIG_NAME': "mds-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "mds-redis${vars.deployment.suffix}",
                            'ELASTIC_ENABLED': "${vars.deployment.elastic_enabled}",
                            'ELASTIC_SERVICE_NAME': "${vars.deployment.elastic_service_name}",
                            'DOCUMENT_CAPACITY':"${vars.DOCUMENT_PVC_SIZE}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'API_URL': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/nris_api",
                    ]
                ],
                [
                    'file':'openshift/tools/schemaspy.dc.json',
                    'params':[
                            'NAME':"schemaspy",
                            'VERSION':"${app.deployment.version}",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'BACKEND_HOST': "https://${vars.modules.'mds-nginx'.HOST_CORE}${vars.modules.'mds-nginx'.PATH}/api",
                            'APPLICATION_DOMAIN': "${vars.modules.'schemaspy'.HOST}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}"
                    ]
                ],
                [
                    'file':'openshift/tools/metabase.dc.json',
                    'params':[
                            'NAME':"metabase",
                            'VERSION':"${app.deployment.version}",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'METABASE_PVC_SIZE':"${vars.METABASE_PVC_SIZE}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'APPLICATION_DOMAIN': "${vars.modules.'metabase'.HOST}",
                            'CPU_REQUEST':"${vars.resources.metabase.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.metabase.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.metabase.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.metabase.memory_limit}"
                    ]
                ],
                [
                    'file':'openshift/tools/logstash.dc.json',
                    'params':[
                            'NAME':"mds-logstash",
                            'VERSION':"${app.deployment.version}",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'DB_CONFIG_NAME': "mds-postgresql${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.logstash.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.logstash.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.logstash.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.logstash.memory_limit}"
                    ]
                ]
        ]
    }
}

environments {
    'test' {
        vars {
            DB_PVC_SIZE = '10Gi'
            DOCUMENT_PVC_SIZE = '5Gi'
            LOG_PVC_SIZE = '1Gi'
            METABASE_PVC_SIZE = '5Gi'
            git {
                changeId = "${opt.'pr'}"
            }
            keycloak {
                clientId_core = "mines-application-test"
                clientId_minespace = "minespace-test"
                resource = "mines-application-test"
                idpHint_core = "idir"
                idpHint_minespace = "bceid"
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
                metabase {
                    cpu_request = "200m"
                    cpu_limit = "500m"
                    memory_request = "1Gi"
                    memory_limit = "2Gi"
                }
                logstash {
                    cpu_request = "100m"
                    cpu_limit = "250m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
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
                    PATH = ""
                }
                'mds-nginx' {
                    HOST_CORE = "minesdigitalservices-${vars.deployment.key}.pathfinder.gov.bc.ca"
                    HOST_MINESPACE = "minespace-${vars.deployment.key}.pathfinder.gov.bc.ca"
                    PATH = ""
                    ROUTE = "/"
                }
                'mds-python-backend' {
                    HOST = "http://mds-python-backend${vars.deployment.suffix}:5000"
                    PATH = "/api"
                }
                'mds-nris-backend' { 
                    HOST = "http://mds-nris-backend${vars.deployment.suffix}:5500"
                    PATH = "/nris-api"
                }
                'mds-redis' {
                    HOST = "http://mds-redis${vars.deployment.suffix}"
                }
                'schemaspy' {
                    HOST = "mds-schemaspy-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'metabase' {
                    HOST = "mds-metabase-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
            }
        }
    }
}
