from flask_restx import Namespace

from app.api.download_token.resources.download_token import DownloadTokenResource

api = Namespace('download-token', description='A for downloading files from the Document Manager.')

api.add_resource(DownloadTokenResource, '/<string:document_guid>')
