from flask_restplus import Namespace

from ..variances.resources.variance_application_status_code import VarianceApplicationStatusCodeResource

api = Namespace('variances', description='Variances actions/options')

api.add_resource(VarianceApplicationStatusCodeResource, '/status-codes')
