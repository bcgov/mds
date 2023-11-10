from flask_restplus import Namespace

from app.api.commons.resources.email_resource import EmailResource

api = Namespace('commons', description='Common operations')

api.add_resource(EmailResource, '/email')
