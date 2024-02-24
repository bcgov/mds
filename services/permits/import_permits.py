import pandas as pd
import boto3
import requests
import sys
import json
import os
import argparse
from authlib.integrations.requests_client import OAuth2Session
from dotenv import find_dotenv, load_dotenv
import os
import pandas as pd
import requests
import json

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

aws_access_key_id=os.getenv('OBJECT_STORE_ACCESS_KEY_ID', None)
aws_access_key_secret=os.getenv('OBJECT_STORE_ACCESS_KEY', None)
aws_endpoint_url=os.getenv('OBJECT_STORE_HOST', 'nrs.objectstore.gov.bc.ca')
s3_bucket = os.environ.get('OBJECT_STORE_BUCKET', '')
permit_service_upload_url = os.getenv('PERMIT_SERVICE_ENDPOINT', 'http://localhost:8004/haystack/file-upload')
JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG', 'https://test.loginproxy.gov.bc.ca/auth/realms/standard/.well-known/openid-configuration')
PERMITS_CLIENT_ID = os.getenv('PERMITS_CLIENT_ID', None)
PERMITS_CLIENT_SECRET = os.getenv('PERMITS_CLIENT_SECRET', None)


def download_from_s3(object_store_path, local_filename):
    session = boto3.session.Session()

    s3 = session.client(
        service_name='s3',
        aws_access_key_id=aws_access_key_id,
        aws_secret_access_key=aws_access_key_secret,
        endpoint_url=f'https://{aws_endpoint_url}'
    )
    print('downloading ', object_store_path, local_filename)

    dirname = os.path.dirname(local_filename)

    if not os.path.exists(dirname):
        os.makedirs(dirname, exist_ok=True)
    
    if not os.path.exists(local_filename):
        s3.download_file(s3_bucket, object_store_path, local_filename)

def post_to_endpoint(metadata, file_path, oauth_session):
    files = {'files': open(file_path, 'rb')}
    response = oauth_session.post(permit_service_upload_url, data=metadata, files=files)

    if response.status_code != 200:
        print(f'Import failed with status code {response.status_code}')
        print(response.text)

def validate_csv_structure(df):
    expected_columns = ['mine_no', 'mine_name', 'permit_no', 'object_store_path', 'issue_date', 'document_name', 'permit_amendment_guid', 'permit_amendment_id', 'description']
    actual_columns = df.columns.tolist()

    if actual_columns != expected_columns:
        raise ValueError("CSV file does not have the expected structure: " + str(expected_columns))


def import_permits(csv_file):
    """
    Downloads files from the given csv file and uploads them to the permit service.

    Args:
        csv_file (str): The path to the CSV file containing permit data.

    Raises:
        ValueError: If any required environment variable is not set.

    Example CSV format:
        mine_no,mine_name,permit_no,object_store_path,issue_date,document_name,permit_amendment_guid,permit_amendment_id,description
        123,mine1,1234,permits/1234/1234.pdf,2021-01-01,1234.pdf,1234,1234,This is a permit

    The following environment variables are required:
        - OBJECT_STORE_ACCESS_KEY_ID
        - OBJECT_STORE_ACCESS_KEY
        - OBJECT_STORE_HOST
        - OBJECT_STORE_BUCKET
        - PERMIT_SERVICE_ENDPOINT
        - PERMITS_CLIENT_ID
        - PERMITS_CLIENT_SECRET
        - JWT_OIDC_WELL_KNOWN_CONFIG
    """

    # Verify that all env variables are set
    required_env_vars = ['OBJECT_STORE_ACCESS_KEY_ID', 'OBJECT_STORE_ACCESS_KEY', 'OBJECT_STORE_HOST', 'OBJECT_STORE_BUCKET', 'PERMIT_SERVICE_ENDPOINT', 'PERMITS_CLIENT_ID', 'PERMITS_CLIENT_SECRET', 'JWT_OIDC_WELL_KNOWN_CONFIG']

    for env_var in required_env_vars:
        if not os.getenv(env_var):
            raise ValueError(f"Environment variable {env_var} is not set.")

    df = pd.read_csv(csv_file)

    validate_csv_structure(df)

    oidc_configuration = requests.get(JWT_OIDC_WELL_KNOWN_CONFIG).json()
    oauth_session = OAuth2Session(client_id=PERMITS_CLIENT_ID, client_secret=PERMITS_CLIENT_SECRET, token_endpoint=oidc_configuration['token_endpoint'], grant_type='client_credentials')
    oauth_session.fetch_token()
    print(f'importing {len(df)} permits')

    for index, row in df.iterrows():
        print(f'importing permit {index+1}/{len(df)}')

        mine_no = row['mine_no']
        mine_name = row['mine_name']
        permit_no = row['permit_no']
        object_store_path = row['object_store_path']
        issue_date = row['issue_date']
        document_name = row['document_name']
        permit_amendment_guid = row['permit_amendment_guid']
        permit_amendment_id = row['permit_amendment_id']
        description = row['description']

        # Download file from S3
        local_filename = '/'.join(object_store_path.split('/')[:-1]) + '/'+document_name
        # print(local_filename)
        download_from_s3(object_store_path, './dl' + '/' +local_filename)

        # Post data to endpoint
        data = {
            'meta': json.dumps({
                'mine_no': mine_no,
                'mine_name': mine_name,
                'permit_no': permit_no,
                'issue_date': issue_date,
                'document_name': document_name,
                'object_store_path': object_store_path,
                'permit_amendment_guid': permit_amendment_guid,
                'permit_amendment_id': permit_amendment_id,
                'description': description
            }),
            'clean_whitespace': True,
            'clean_header_footer': True,
        }

        post_to_endpoint(data, './dl/' + local_filename, oauth_session)


def parse_arguments():
    parser = argparse.ArgumentParser(description='Permits Import Script')
    parser.add_argument('csv_file', type=str, help='Path to the CSV file')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_arguments()
    csv_file = args.csv_file
    
    import_permits(csv_file)