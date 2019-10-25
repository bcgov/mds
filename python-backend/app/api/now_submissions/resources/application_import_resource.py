# from flask_restplus import Resource
# from werkzeug.exceptions import NotFound

# from app.extensions import api
# from app.api.now_submissions.models.application import Application
# from app.api.now_submissions.response_models import APPLICATION
# from app.api.utils.resources_mixins import UserMixin 


# class ApplicationImportResource(Resource, UserMixin ):
#     @api.doc(description='Import a NoW submission into an application', params={})
#     @requires_role_view_all
#     @api.marshal_with(APPLICATION, code=200)
#     def post(self, submission_guid):
#         application = Application.find_by_application_guid(application_guid)
#         if not application:
#             raise NotFound('Application not found')

#         return application