from models.pod import POD
import os
from util.env_builder import EnvBuilder


def run_job():

    suffix = os.getenv("SUFFIX", "-pr-NUM")

    builder = EnvBuilder()

    # Add database environment config
    builder.add_value(key='DB_HOST', value=f'mds-postgresql{suffix}')
    builder.add_value(key='DB_PORT', value='5432')
    builder.add_secret(
        key='DB_USER', secret_name=f'mds-postgresql{suffix}', secret_key='database-user')
    builder.add_secret(
        key='DB_NAME', secret_name=f'mds-postgresql{suffix}', secret_key='database-name')
    builder.add_secret(
        key='DB_PASS', secret_name=f'mds-postgresql{suffix}', secret_key='database-password')

    # Add elastic config
    builder.add_value(key='ELASTIC_ENABLED', value='0')
    builder.add_value(key='ELASTIC_SERVICE_NAME', value='NOW ETL')
    builder.add_secret(
        key='ELASTIC_SECRET_TOKEN',
        secret_name='template.mds-elastic-secret',
        secret_key='secret-token')
    builder.add_secret(
        key='ELASTIC_SERVER_URL',
        secret_name='template.mds-elastic-secret',
        secret_key='server-url')

    env = builder.to_json()

    pod = POD(
        pod_name='digdag-now-etl',
        env_pod='mds-now-etl',
        env=env,
        image_namespace='empr-mds-tools',
        command=["python", "now_etls.py"])

    pod.create_pod()
    print("Job finished")


def run_streamline_job():

    suffix = os.getenv("SUFFIX", "-pr-NUM")

    builder = EnvBuilder()

    builder.add_value(key='SRC_DB_HOST', value='response.bcgov')
    builder.add_value(key='SRC_DB_PORT', value='1521')
    builder.add_secret(
        key='SRC_DB_USER',
        secret_name='template.mds-postgresql-mms-fdw-secret',
        secret_key='oracle-fdw-user')
    builder.add_value(key='SRC_DB_NAME', value='memprd.env.gov.bc.ca')
    builder.add_secret(
        key='SRC_DB_PASS',
        secret_name=f'template.mds-postgresql-mms-fdw-secret',
        secret_key='oracle-fdw-password')

    builder.add_value(key='TGT_DB_HOST', value=f'mds-postgresql{suffix}')
    builder.add_value(key='TGT_DB_PORT', value='5432')
    builder.add_secret(
        key='TGT_DB_USER', secret_name=f'mds-postgresql{suffix}', secret_key='database-user')
    builder.add_secret(
        key='TGT_DB_NAME', secret_name=f'mds-postgresql{suffix}', secret_key='database-name')
    builder.add_secret(
        key='TGT_DB_PASS', secret_name=f'mds-postgresql{suffix}', secret_key='database-password')

    env = builder.to_json()

    pod = POD(
        pod_name='digdag-now-streamline-etl',
        env_pod='mds-now-streamline-etl',
        env=env,
        image_namespace='empr-mds-tools',
        command=["python", "now_streamline_etl.py"])

    pod.create_pod()
    print("Job finished")
