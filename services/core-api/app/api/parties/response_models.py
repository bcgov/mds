from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus, MinePartyAcknowledgedStatus
from app.extensions import api
from flask_restx import fields


class Date(fields.Raw):
    def format(self, value):
        return value.strftime("%Y-%m-%d") if value else None

MINE_DOCUMENT = api.model(
    'MineDocument', {
        'mine_document_guid': fields.String,
        'mine_guid': fields.String,
        'document_manager_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.DateTime,
    })

MINE_PARTY_APPT_TYPE_MODEL = api.model(
    'MinePartyApptType', {
        'mine_party_appt_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'person': fields.Boolean,
        'organization': fields.Boolean,
        'grouping_level': fields.Integer,
        'active_ind': fields.Boolean
    })

PARTY_BUSINESS_ROLE = api.model(
    'PartyBusinessRoleCode', {
        'party_business_role_code': fields.String,
        'description': fields.String,
        'active_ind': fields.Boolean
    })

MINE_PARTY_APPT = api.model(
    'MinePartyAppointment', {
        'mine_party_appt_guid': fields.String,
        'mine_guid': fields.String,
        'party_guid': fields.String,
        'related_guid': fields.String,
        'permit_no': fields.String(attribute='permit.permit_no'),
        'mine_party_appt_type_code': fields.String,
        'start_date': fields.Date,
        'end_date': fields.Date,
        'documents': fields.Nested(MINE_DOCUMENT),
        'union_rep_company': fields.String,
        'status': fields.String(enum=MinePartyAppointmentStatus, attribute='status.name'),
        'mine_party_acknowledgement_status': fields.String(
            enum=MinePartyAcknowledgedStatus, attribute='mine_party_acknowledgement_status.name'),
    })

NOW_APPLICATION_MODEL = api.model('NOWApplication', {
    'now_application_guid': fields.String,
    'now_number': fields.String,
    'submitted_date': Date,
})

NOW_PARTY_APPOINTMENT = api.model(
    'NOW_PARTY_APPOINTMENT', {
        'now_party_appointment_id': fields.Integer,
        'mine_party_appt_type_code': fields.String,
        'mine_party_appt_type_code_description': fields.String,
        'party_guid': fields.String,
        'now_application': fields.Nested(NOW_APPLICATION_MODEL),
    })

ADDRESS = api.model(
    'Address', {
        'suite_no': fields.String,
        'address_line_1': fields.String,
        'address_line_2': fields.String,
        'city': fields.String,
        'sub_division_code': fields.String,
        'post_code': fields.String,
        'address_type_code': fields.String,
    })

PARTY_ORGBOOK_ENTITY = api.model(
    'PartyOrgBookEntity', {
        'party_orgbook_entity_id': fields.Integer,
        'registration_id': fields.String,
        'registration_status': fields.Boolean,
        'registration_date': fields.DateTime,
        'name_id': fields.Integer,
        'name_text': fields.String,
        'credential_id': fields.Integer,
        'party_guid': fields.String,
        'association_user': fields.String,
        'association_timestamp': fields.DateTime,
        'company_alias': fields.String
    })

PARTY_BUSINESS_ROLE_APPT = api.model(
    'PartyBusinessRoleAppointment', {
        'party_business_role_appt_id': fields.Integer,
        'party_business_role_code': fields.String,
        'start_date': fields.DateTime,
        'end_date': fields.DateTime,
    })

ORGANIZATION = api.model(
    'Party', {
        'party_guid': fields.String,
        'party_name': fields.String,
    }
)

# NOTE: Including the signature could impact performance if it is not required for every party request (and just inspector requests).
PARTY = api.model(
    'Party', {
        'party_guid': fields.String,
        'party_type_code': fields.String,
        'phone_no': fields.String,
        'phone_ext': fields.String,
        'phone_no_sec': fields.String,
        'phone_sec_ext': fields.String,
        'phone_no_ter': fields.String,
        'phone_ter_ext': fields.String,
        'email': fields.String,
        'email_sec': fields.String,
        'party_name': fields.String,
        'name': fields.String,
        'first_name': fields.String,
        'address': fields.List(fields.Nested(ADDRESS)),
        'mine_party_appt': fields.Nested(MINE_PARTY_APPT),
        'job_title': fields.String,
        'job_title_code': fields.String,
        'postnominal_letters': fields.String,
        'idir_username': fields.String,
        'party_orgbook_entity': fields.Nested(PARTY_ORGBOOK_ENTITY, skip_none=True),
        'business_role_appts': fields.List(fields.Nested(PARTY_BUSINESS_ROLE_APPT, skip_none=True)),
        'signature': fields.String,
        'now_party_appt': fields.Nested(NOW_PARTY_APPOINTMENT),
        'organization_guid': fields.String,
        'organization': fields.Nested(ORGANIZATION, skip_none=True),
        "digital_wallet_connection_status": fields.String,
        'middle_name': fields.String
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

PAGINATED_PARTY_LIST = api.inherit('PartyList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(PARTY)),
})

SUB_DIVISION_CODE_MODEL = api.model(
    'SubDivisionCodeModel', {
        'sub_division_code': fields.String,
        'address_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })
