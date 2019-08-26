from models.pod import POD


def run_job():
    env = '''
    [
        {
            "name": "DB_USER",
            "valueFrom": {
                    "secretKeyRef": {
                        "key": "database-user",
                        "name": "mds-postgresql-pr-943"
                    }
            }
        },
        {
            "name": "DB_HOST",
            "value": "mds-postgresql-pr-943"
        },
        {
            "name": "DB_PASS",
            "valueFrom": {
                    "secretKeyRef": {
                        "key": "database-password",
                        "name": "mds-postgresql-pr-943"
                    }
            }
        },
        {
            "name": "DB_PORT",
            "value": "5432"
        },
        {
            "name": "DB_NAME",
            "valueFrom": {
                    "secretKeyRef": {
                        "key": "database-name",
                        "name": "mds-postgresql-pr-943"
                    }
            }
        },
        {
            "name": "ELASTIC_ENABLED",
            "value": "0"
        },
        {
            "name": "ELASTIC_SERVICE_NAME",
            "value": "NOW ETL"
        },
        {
            "name": "ELASTIC_SECRET_TOKEN",
            "valueFrom": {
                    "secretKeyRef": {
                        "key": "secret-token",
                        "name": "template.mds-elastic-secret"
                    }
            }
        },
        {
            "name": "ELASTIC_SERVER_URL",
            "valueFrom": {
                    "secretKeyRef": {
                        "key": "server-url",
                        "name": "template.mds-elastic-secret"
                    }
            }
        }
    ]
    '''

    pod = POD(pod_name='digdag-now-etl',
              env_pod='mds-now-etl',
              env=env,
              image_namespace='empr-mds-tools',
              command=["python", "now_etls.py"])

    pod.create_pod()
    print("Job finished")
