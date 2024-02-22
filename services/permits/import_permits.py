import pandas as pd
import boto3
import requests
import sys
import json
import os
def download_from_s3(object_store_path, local_filename):
    session = boto3.session.Session()

    s3 = session.client(
        service_name='s3',
        aws_access_key_id='',
        aws_secret_access_key='',
        endpoint_url=''
    )
    bucket_name = 'zvmrwj'
    print('downloading ', object_store_path, local_filename)

    dirname = os.path.dirname(local_filename)

    if not os.path.exists(dirname):
        os.makedirs(dirname, exist_ok=True)
    
    if not os.path.exists(local_filename):
        s3.download_file(bucket_name, object_store_path, local_filename)

def post_to_endpoint(data, file_path, endpoint_url):
    files = {'files': open(file_path, 'rb')}
    response = requests.post(endpoint_url, data=data, files=files)
    print(response.text)

def main(csv_file, endpoint_url):
    df = pd.read_csv(csv_file)

    for index, row in df.iterrows():
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
        print(data)
        post_to_endpoint(data, './dl/' + local_filename, endpoint_url)

if __name__ == "__main__":
    csv_file = sys.argv[1]
    endpoint_url = 'http://localhost:8004/haystack/file-upload'
    main(csv_file, endpoint_url)
