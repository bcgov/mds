from flask_restplus import Namespace

from app.api.emli_contacts.resources.emli_contact_list import emliContactListResource
from app.api.emli_contacts.resources.emli_contact import emliContactResource

api = Namespace('emli-contacts', description='EMLI contact information')

api.add_resource(emliContactResource, '/<string:contact_guid>')
api.add_resource(emliContactListResource, '', '/<string:mine_region_code>/contacts')