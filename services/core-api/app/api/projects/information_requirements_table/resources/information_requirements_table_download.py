from flask_restx import Resource
from flask import send_file
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.config import Config


class InformationRequirementsTableDownloadResource(Resource, UserMixin):
    @api.doc(description='Get the Information Requirements Table (IRT) template.')
    @api.response(200, 'Successfully downloaded.')
    def get(self):
        filename = Config.TEMPLATE_FOLDER_IRT + Config.TEMPLATE_IRT
        return send_file(
            path_or_file=filename, download_name=Config.TEMPLATE_IRT, as_attachment=True)
