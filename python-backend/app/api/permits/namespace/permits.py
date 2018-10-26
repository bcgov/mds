from flask_restplus import Namespace

from ..permit.resources.permit import PermitResource
from ..permittee.resources.permittee import PermitteeResource

api = Namespace('permits', description='Permit related operations')

api.add_resource(PermitResource, '', '/<string:permit_guid>')
api.add_resource(PermitteeResource, '/permittees', '/permittees/<string:permittee_guid>')
