from flask_restplus import Namespace

from ..resources.variance_application_status_code import VarianceApplicationStatusCodeResource
from ..resources.variance_resource import VarianceResource

api = Namespace('variances', description='Variances actions/options')

api.add_resource(VarianceResource, '')
api.add_resource(VarianceApplicationStatusCodeResource, '/status-codes')
