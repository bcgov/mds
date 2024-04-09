from flask_restx import Namespace
from app.api.report_error.resources.report_error_resource import ReportErrorResource

api = Namespace('report-error', description='Error report operations')

api.add_resource(ReportErrorResource, '')
