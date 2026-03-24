from flask_restx import Namespace

from app.api.email_preview.resources.email_preview_resource import EmailPreviewResource, EmailPreviewListResource

api = Namespace('email-preview', description='Email Template Preview API')

api.add_resource(EmailPreviewListResource, '')
api.add_resource(EmailPreviewResource, '/<path:template_name>')