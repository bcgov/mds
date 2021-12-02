from flask_restplus import Namespace

from app.api.EMLI_contacts.resources.EMLI_contact_list import EMLIContactListResource
from app.api.EMLI_contacts.resources.EMLI_contact import EMLIContactResource

api = Namespace('EMLI-contacts', description='EMLI contact information')

api.add_resource(EMLIContactListResource, '', '/<string:mine_region_code>')
api.add_resource(EMLIContactResource, '/<int:contact_id>')
