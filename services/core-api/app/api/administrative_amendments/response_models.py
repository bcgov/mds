from app.extensions import api
from flask_restplus import fields

from app.api.parties.response_models import PARTY
from app.api.mines.response_models import MINE_DOCUMENT_MODEL


class DateTime(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d %H:%M") if value else None


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None


PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

ADMINISTRATIVE_AMENDMENT_VIEW_MODEL = api.model(
    'ADMINISTRATIVE_AMENDMENT_VIEW_MODEL', {
        'application_guid': fields.String,
        'mine_guid': fields.String,
        'mine_no': fields.String,
        'mine_name': fields.String,
        'mine_region': fields.String,
        'administrative_amendment_number': fields.String,
        'permit_guid': fields.String(attribute='permit.permit_guid'),
        'permit_no': fields.String(attribute='permit.permit_no'),
        'lead_inspector_party_guid': fields.String,
        'lead_inspector_name': fields.String,
        'application_type_description': fields.String,
        'application_status_description': fields.String,
        'received_date': Date,
        'import_timestamp': DateTime,
        'update_timestamp': DateTime,
    })

ADMINISTRATIVE_AMENDMENT_VIEW_LIST = api.inherit(
    'AdministrativeAmendmentList', PAGINATED_LIST, {
        'records': fields.List(fields.Nested(ADMINISTRATIVE_AMENDMENT_VIEW_MODEL)),
    })