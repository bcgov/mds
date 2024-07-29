import base64
import hashlib
import hmac
import logging
import mimetypes
import os
import time
import urllib.parse

import requests
from flask import current_app
from requests_toolbelt import MultipartEncoder
from werkzeug.exceptions import InternalServerError


def url_encode(s):
    s1 = urllib.parse.quote(s)
    s2 = str.replace(s1, '_', '%2F')
    return str.replace(s2, '-', '%2B')

def sign(message, key):
    key = bytes(key, 'UTF-8')
    message = bytes(message, 'UTF-8')
    digester = hmac.new(key, message, hashlib.sha1)
    signature = digester.digest()
    signature64 = base64.urlsafe_b64encode(signature)
    return str(signature64, 'UTF-8')


class GeomarkHelper:
    def __init__(self):
        self.GEOMARK_GROUP = current_app.config['GEOMARK_GROUP']
        self.GEOMARK_URL_BASE = current_app.config['GEOMARK_URL_BASE']
        self.GEOMARK_SECRET_KEY = current_app.config['GEOMARK_SECRET_KEY']
        self.GEOMARK_PERSIST = current_app.config['GEOMARK_PERSIST']

        assert self.GEOMARK_URL_BASE, 'GEOMARK_URL_BASE is not set in the configuration'

        if self.GEOMARK_PERSIST:
            assert self.GEOMARK_GROUP, 'GEOMARK_GROUP is not set in the configuration'
            assert self.GEOMARK_SECRET_KEY, 'GEOMARK_SECRET_KEY is not set in the configuration'
            current_app.logger.info('Geomark is configured to persist data')
        else:
            current_app.logger.warning('Geomark is not configured to persist data. GEOMARK_PERSIST is set to False')


    def add_geomark_to_group(self, geomark_id, group_id):
        # Adds geomark to the given group to permanently store it
        # https://test.apps.gov.bc.ca/pub/geomark/docs/rest-api/#ca.bc.gov.geomark.web.rest.GeomarkGroup.addGeomarkToGroup
        current_app.logger.info(f"Adding geomark {geomark_id} to group {group_id}")
        timestamp = str(int(time.time() * 1000))

        signature = sign(f"/geomarkGroups/{group_id}/geomarks/add:{timestamp}:geomarkId={geomark_id}", self.GEOMARK_SECRET_KEY)
        encoded_signature = url_encode(signature)

        url = f"{self.GEOMARK_URL_BASE}/geomarkGroups/{group_id}/geomarks/add?geomarkId={geomark_id}&signature={encoded_signature}&time={timestamp}"
        print(url)
        response = requests.post(url, headers = {'Accept': 'application/json'})

        if response.status_code != 200:
            raise InternalServerError('Error adding geomark to group. Geomark service returned status code: ' + str(response.status_code))
        
        resp = response.json()

        if resp.get('status') != 'Added':
            raise InternalServerError('Error adding geomark to group. Geomark service returned status: ' + resp.get('status'))

        current_app.logger.info(f"Geomark {geomark_id} successfully added to group {group_id}")

        return resp

    def send_spatial_file_to_geomark(self,file_path):
        try:
            file_extension = os.path.splitext(file_path)[1].lstrip('.')

            # Ensure the format is one of the allowed ones
            assert file_extension in ['shpz', 'kml', 'kmz'], "Invalid file format. Must be one of: 'shpz', 'kml', 'kmz'."

            mime_type = mimetypes.guess_type(file_path)[0]

            url = f'{self.GEOMARK_URL_BASE}/geomarks/new'

            # https://apps.gov.bc.ca/pub/geomark/docs/coordinateSystems.html
            accepted_projection = {
                'shpz': '3005', # BC Albers
                'kmz': '3005', # BC Albers
                'kml': '4326', # WGS 84 <-- kml files are always in this projection
            }

            with open(file_path, 'rb') as file:
                multipart_data = MultipartEncoder(
                    fields={
                        'body': (os.path.basename(file_path), file, mime_type),
                        'resultFormat': 'json',
                        'format': file_extension,
                        'srid': accepted_projection[file_extension] # Validate that the projection is correct
                    }
                )
                headers = {
                    'Content-Type': multipart_data.content_type
                }
                # Send the request
                response = requests.post(
                    url,
                    data=multipart_data,
                    headers=headers
                )
        finally:
            # Delete the file
            os.remove(file_path)

        response_data = response.json() if response.text.strip() else None

        if response_data:            
            gemoark_id = response_data.get('id')

            if gemoark_id:
                current_app.logger.info(f"Geomark {gemoark_id} was successfully created")
        
                if self.GEOMARK_PERSIST:
                    self.add_geomark_to_group(gemoark_id, self.GEOMARK_GROUP)
            else:
                current_app.logger.error('Error uploading spatial file to Geomark: ', response.text)

        return response.json() if response.text.strip() else None
