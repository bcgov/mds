from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource
from ..permit_amendment.resources.permit_amendment import PermitAmendmentResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '', '/<string:permit_guid>')
api.add_resource(PermitAmendmentResource, '/<string:permit_guid>/amendments',
                 '/amendment/<string:permit_amendment_id>',
                 '/<string:permit_guid>/amendment/<string:permit_amendment_id>')
