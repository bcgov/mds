from flask_restplus import Resource
from flask import send_file
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.config import Config


class InformationRequirementsTableDownloadResource(Resource, UserMixin):
    @api.doc(description='Get the Information Requirements Table (IRT) template.')
    @api.response(200, 'Successfully downloaded.')
    def get(self):
        fn = Config.TEMPLATE_FOLDER_IRT + Config.TEMPLATE_IRT
        return send_file(
            filename_or_fp=fn, attachment_filename=Config.TEMPLATE_IRT, as_attachment=True)
