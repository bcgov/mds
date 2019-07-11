from flask_restplus import Namespace

from app.api.document_manager.resources.download_token import DownloadTokenResource

api = Namespace('document-manager', description='Document Manager for uploading and keeping track of files and then serving them to users.')

api.add_resource(DownloadTokenResource, '/<string:document_guid>/token')
