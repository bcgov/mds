from flask_restx import Namespace

from app.api.ministry_contacts.resources.ministry_contact_list import MinistryContactListResource
from app.api.ministry_contacts.resources.ministry_contact import MinistryContactResource

api = Namespace('ministry-contacts', description='MCM contact information')

api.add_resource(MinistryContactResource, '/<string:contact_guid>')
api.add_resource(MinistryContactListResource, '', '/<string:mine_region_code>/contacts')
