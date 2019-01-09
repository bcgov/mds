from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '', '/<string:permit_guid>')
