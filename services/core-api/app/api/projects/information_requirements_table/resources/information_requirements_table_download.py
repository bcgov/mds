from app.api.utils.access_decorators import public_endpoint
from app.api.utils.resources_mixins import UserMixin
from app.config import Config
from app.extensions import api
from flask import send_file
from flask_restx import Resource


class InformationRequirementsTableDownloadResource(Resource, UserMixin):
    @api.doc(description='Get the Information Requirements Table (IRT) template.')
    @api.response(200, 'Successfully downloaded.')
    @public_endpoint
    def get(self):
        filename = Config.TEMPLATE_FOLDER_IRT + Config.TEMPLATE_IRT
        return send_file(
            path_or_file=filename, download_name=Config.TEMPLATE_IRT, as_attachment=True)
