from flask_restplus import Namespace

from .resources.download_token import DownloadTokenResource

api = Namespace('download-token', description='A for downloading files from the Document Manager.')

api.add_resource(DownloadTokenResource, '/<string:document_guid>')
