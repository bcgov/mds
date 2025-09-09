import pytest
from regex import template
from app.api.now_applications import now_template_transformer as now_template_transformer
from werkzeug.exceptions import NotFound

from app.api.utils.helpers import format_currency
from tests.factories import PartyFactory, PermitAmendmentFactory, PermitFactory, create_mine_and_permit
from tests.now_application_factories import NOWApplicationFactory, NOWApplicationIdentityFactory

def test_get_default_disturbance_or_cost_field_none(db_session):
    now_application = NOWApplicationFactory()
    now_application.field = None
    assert now_template_transformer.get_default_disturbance_or_cost(now_application, 'field') == '0'

def test_get_default_disturbance_or_cost_currency(db_session):
    now_application = NOWApplicationFactory()
    now_application.field = 1234.56
    assert now_template_transformer.get_default_disturbance_or_cost(now_application, 'field', currency=True) == "$1,234.56"

def test_get_default_disturbance_or_cost_str(db_session):
    now_application = NOWApplicationFactory()
    now_application.field = 42
    assert now_template_transformer.get_default_disturbance_or_cost(now_application, 'field') == '42'

def test_replace_condition_value_with_data_basic(db_session):
    condition = "The mine_no is {mine_no} and the access roads cost {exploration_access.cost} "
    condition_var = {"mine_no": "12345", "exploration_access.cost": "$1000"}
    result = now_template_transformer.replace_condition_value_with_data(condition, condition_var)
    assert "12345" in result and "$1000" in result
    assert '{' not in result and '}' not in result

def test_calculate_liability_new_permit(db_session):
    now_application = NOWApplicationFactory()
    now_application.type_of_application="New Permit"
    now_application.liability_adjustment=100
    assert now_template_transformer.calculate_liability(now_application) == 100.0

def test_calculate_liability_amendment(db_session):
    mine,permit = create_mine_and_permit(permit_kwargs={"remaining_static_liability": 25})
    now_application = NOWApplicationFactory()
    now_application.type_of_application="Amendment"
    now_application.liability_adjustment=50
    assert now_template_transformer.calculate_liability(now_application) == 75.0

def test_transform_variables_to_data_keys(db_session):
    mine,permit = create_mine_and_permit()
    now_application = NOWApplicationFactory()
    permit_amendment = PermitAmendmentFactory(mine=mine, permit=permit)
    now_application_identity = NOWApplicationIdentityFactory(now_application=now_application, mine=mine)
    permit_amendment.now_application_guid = now_application_identity.now_application_guid
    now_application.now_application_identity = now_application_identity
    total_liability = now_template_transformer.calculate_liability(now_application)
    data = now_template_transformer.transform_variables_to_data(now_application, permit_amendment, mine, total_liability)
    assert data['mine_name'] == mine.mine_name
    assert data['mine_no'] == mine.mine_no
    assert data['application_type'] == now_application.notice_of_work_type.description
    assert data['total_liability'] == format_currency(total_liability)
    assert data['regional_mine_inbox'] == mine.region.regional_contact_office.email

def test_transform_template_data_no_permit(db_session):
    now_application = NOWApplicationFactory()
    with pytest.raises(Exception) as extext:
        now_template_transformer.transform_template_data('PMT', {'preamble_text': ''}, now_application)
    assert "Notice of Work has no permit" in str(extext.value)

def test_transform_template_data_missing_inspector(db_session):
    mine,permit = create_mine_and_permit()
    now_application = NOWApplicationFactory()
    permit_amendment = PermitAmendmentFactory(mine=mine, permit=permit)
    now_application_identity = NOWApplicationIdentityFactory(now_application=now_application, mine=mine)
    permit_amendment.now_application_guid = now_application_identity.now_application_guid
    now_application.now_application_identity = now_application_identity
    now_application.issuing_inspector = None
    with pytest.raises(Exception) as extext:
        now_template_transformer.transform_template_data('PMT', {'preamble_text': ''}, now_application)
    assert "No Issuing Inspector has been assigned" in str(extext.value)

def test_transform_template_data_letter(db_session):
    mine, permit = create_mine_and_permit()
    now_application = NOWApplicationFactory()
    permit_amendment = PermitAmendmentFactory(mine=mine, permit=permit)
    now_application_identity = NOWApplicationIdentityFactory(now_application=now_application, mine=mine)
    permit_amendment.now_application_guid = now_application_identity.now_application_guid
    now_application.now_application_identity = now_application_identity
    now_application.issuing_inspector.signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
    party = PartyFactory(company=True)
    template_data = now_template_transformer.transform_template_data('CAL', {'preamble_text': '', 'proponent_name': party.party_name, 'letter_dt': 'Sep 09 2025', 'application_dt': 'Sep 05 2025', 'mine_name': mine.mine_name}, now_application)

    assert isinstance(template_data, dict)
    assert template_data['mine_name'] == mine.mine_name
    assert 'organization_email' in template_data
    assert 'letter_dt' in template_data
    assert 'application_dt' in template_data
    assert 'images' in template_data

def test_transform_template_data_permit(db_session):
    mine, permit = create_mine_and_permit()
    now_application = NOWApplicationFactory()
    permit_amendment = PermitAmendmentFactory(mine=mine, permit=permit)
    now_application_identity = NOWApplicationIdentityFactory(now_application=now_application, mine=mine)
    permit_amendment.now_application_guid = now_application_identity.now_application_guid
    now_application.now_application_identity = now_application_identity
    now_application.issuing_inspector.signature = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII="
    template_data = now_template_transformer.transform_template_data('PMT', {'preamble_text': ''}, now_application)

    assert isinstance(template_data, dict)
    assert template_data['mine_name'] == mine.mine_name
    assert template_data['latitude'] == str(now_application.latitude)
    assert template_data['longitude'] == str(now_application.longitude)
    assert 'security_adjustment' in template_data
    assert 'conditions' in template_data
    assert template_data['is_draft'] == False