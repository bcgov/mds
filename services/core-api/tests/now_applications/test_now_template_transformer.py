from datetime import datetime
import pytest
from regex import template
from app.api.now_applications import now_template_transformer as now_template_transformer
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from werkzeug.exceptions import NotFound

from app.api.utils.helpers import format_currency
from tests.factories import PartyFactory, PermitAmendmentFactory, PermitConditionsFactory, PermitFactory, create_mine_and_permit, MineDocumentFactory
from tests.now_application_factories import NOWApplicationFactory, NOWApplicationIdentityFactory
from app.extensions import db


def _add_permit_package_document(db_session, now_application, mine, *, preamble_title, final_package_order,
                                  is_final_package=True, now_application_document_type_code='OTH',
                                  is_system_generated=False):
    # Setting now_application_id AND appending to now_application.documents both populate the same row.
    #  Since `documents` has no back_populates, doing both makes the row appear twice in the in-memory collection.
    # Set the FK only, then expire the cached collection so the next access re-queries it cleanly.
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application.now_application_id,
        now_application_document_type_code=now_application_document_type_code,
        mine_document=MineDocumentFactory(mine=mine),
        is_final_package=is_final_package,
        is_system_generated=is_system_generated,
        final_package_order=final_package_order,
        preamble_title=preamble_title)
    db_session.add(xref)
    db_session.flush()
    db_session.expire(now_application, ['documents'])
    return xref

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
        now_template_transformer.transform_permit({'preamble_text': ''}, now_application)
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
        now_template_transformer.transform_permit({'preamble_text': ''}, now_application)
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
    template_data = now_template_transformer.transform_letter({'preamble_text': '', 'proponent_name': party.party_name, 'letter_dt': 'Sep 09 2025', 'application_dt': 'Sep 05 2025', 'mine_name': mine.mine_name}, now_application, 'CAL')

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
    template_data = now_template_transformer.transform_permit({'preamble_text': ''}, now_application)

    assert isinstance(template_data, dict)
    assert template_data['mine_name'] == mine.mine_name
    assert template_data['latitude'] == str(now_application.latitude)
    assert template_data['longitude'] == str(now_application.longitude)
    assert 'security_adjustment' in template_data
    assert 'conditions' in template_data
    assert template_data['is_draft'] == False

def test_replace_condition_value_with_data_on_nested_permit_conditions(db_session):
    """The recursive resolution pattern used at issuance should substitute tokens
    in both parent and child PermitConditions rows."""
    mine, permit = create_mine_and_permit()
    amendment = PermitAmendmentFactory(mine=mine, permit=permit, conditions=0)

    parent = PermitConditionsFactory(permit_amendment=amendment, condition='{mine_name} permit condition.')
    child = PermitConditionsFactory(permit_amendment=amendment, condition='Sub-condition for {mine_no}.')
    child.parent_permit_condition_id = parent.permit_condition_id
    db.session.flush()

    condition_variables = {'mine_name': 'Red Mountain Mine', 'mine_no': 'M-123'}

    def _resolve(condition):
        if condition.condition:
            condition.condition = now_template_transformer.replace_condition_value_with_data(
                condition.condition, condition_variables)
        for sub in condition.sub_conditions:
            _resolve(sub)

    _resolve(parent)

    assert parent.condition == 'Red Mountain Mine permit condition.'
    assert child.condition == 'Sub-condition for M-123.'
    assert '{' not in parent.condition
    assert '{' not in child.condition


def test_replace_condition_value_with_data_preamble(db_session):
    """preamble_text tokens should be substituted just like condition text."""
    mine, permit = create_mine_and_permit()
    amendment = PermitAmendmentFactory(mine=mine, permit=permit, conditions=0)
    amendment.preamble_text = 'This permit is issued for {mine_name} (No. {mine_no}).'

    now_application = NOWApplicationFactory()
    now_application_identity = NOWApplicationIdentityFactory(now_application=now_application, mine=mine)
    amendment.now_application_guid = now_application_identity.now_application_guid
    now_application.now_application_identity = now_application_identity

    total_liability = now_template_transformer.calculate_liability(now_application)
    condition_variables = now_template_transformer.transform_variables_to_data(
        now_application, amendment, mine, total_liability)

    amendment.preamble_text = now_template_transformer.replace_condition_value_with_data(
        amendment.preamble_text, condition_variables)

    assert mine.mine_name in amendment.preamble_text
    assert mine.mine_no in amendment.preamble_text
    assert '{' not in amendment.preamble_text
    assert '}' not in amendment.preamble_text


def test_ordered_permit_package_documents_orders_by_final_package_order(db_session):
    """Order labels must follow final_package_order, not insertion order, to match the
    front-end's getOrderedPermitPackageDocuments."""
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application

    second = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Second Doc', final_package_order=2)
    first = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='First Doc', final_package_order=1)

    ordered = now_template_transformer._ordered_permit_package_documents(now_application)

    assert [label for label, _, _ in ordered] == ['1.2', '1.3']
    assert [title for _, _, title in ordered] == ['First Doc', 'Second Doc']
    assert ordered[0][1] == str(first.now_application_document_xref_guid)
    assert ordered[1][1] == str(second.now_application_document_xref_guid)


def test_ordered_permit_package_documents_locked_ntr_row_is_always_first_and_1_1(db_session):
    """The locked, system-generated NTR row (identified by now_application.locked_ntr_guid)
    always sorts first and is always labelled "1.1", regardless of when it was added relative to
    other permit package documents - once this application actually meets the front-end's
    criteria for that row (NOW type, Technical Review completed).
    """
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    identity.application_type_code = 'NOW'
    now_application.application_progress[0].end_date = datetime.utcnow()
    db_session.flush()
    db_session.expire(now_application, ['now_application_identity'])

    _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Real Doc', final_package_order=1)
    locked = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Notice of Work Application',
        final_package_order=2, now_application_document_type_code='NTR', is_system_generated=True)

    ordered = now_template_transformer._ordered_permit_package_documents(now_application)

    assert ordered[0] == ('1.1', str(locked.now_application_document_xref_guid),
                           'Notice of Work Application')
    assert ordered[1][0] == '1.2'


def test_ordered_permit_package_documents_locked_row_not_treated_as_1_1_before_technical_review_completes(db_session):
    """This is the exact divergence the front-end's technicalReviewEverCompleted gate exists to
    prevent (e.g. Technical Review being reset/redone can leave a system-generated NTR doc in
    place before review has ever actually completed) - that doc must NOT be labelled "1.1" until
    this application actually meets the front-end's full criteria, so the backend can never
    disagree with the CDV picker on which row (if any) is locked."""
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    identity.application_type_code = 'NOW'
    db_session.flush()
    db_session.expire(now_application, ['now_application_identity'])
    # application_progress defaults to a REV row with no end_date - Technical Review not yet complete.

    _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Real Doc', final_package_order=1)
    not_yet_locked = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Notice of Work Application',
        final_package_order=2, now_application_document_type_code='NTR', is_system_generated=True)

    ordered = now_template_transformer._ordered_permit_package_documents(now_application)

    assert ('1.1', str(not_yet_locked.now_application_document_xref_guid),
            'Notice of Work Application') not in ordered
    assert [label for label, _, _ in ordered] == ['1.2', '1.3']


def test_ordered_permit_package_documents_excludes_documents_not_in_the_package(db_session):
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application

    _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Not in package',
        final_package_order=None, is_final_package=False)

    assert now_template_transformer._ordered_permit_package_documents(now_application) == ()


def test_resolve_permit_package_file_reference_found_and_not_found(db_session):
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    doc = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Site Map', final_package_order=1)

    guid = str(doc.now_application_document_xref_guid)
    label_map = now_template_transformer.build_permit_package_file_label_map(now_application)
    assert now_template_transformer.resolve_permit_package_file_reference(
        guid, label_map) == '1.2 Site Map'
    assert now_template_transformer.resolve_permit_package_file_reference(
        '00000000-0000-0000-0000-000000000000', label_map) is None


def test_resolve_permit_package_file_tokens_replaces_valid_and_broken_tokens(db_session):
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    doc = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Site Map', final_package_order=1)
    guid = str(doc.now_application_document_xref_guid)
    label_map = now_template_transformer.build_permit_package_file_label_map(now_application)

    text = (f"See {{permit_package_file:{guid}}} and "
            "{permit_package_file:00000000-0000-0000-0000-000000000000}.")
    result = now_template_transformer.resolve_permit_package_file_tokens(text, label_map)

    assert result == "See 1.2 Site Map and Reference unavailable."


def test_resolve_permit_package_file_tokens_noop_without_label_map(db_session):
    """Legacy/CLI callers that don't have a label_map on hand pass None - this must be a safe
    no-op rather than an error, leaving the token for the caller's own brace-stripping."""
    text = "See {permit_package_file:abc} for details."
    assert now_template_transformer.resolve_permit_package_file_tokens(text, None) == text


def test_resolve_permit_package_file_tokens_noop_for_empty_text(db_session):
    assert now_template_transformer.resolve_permit_package_file_tokens('', {}) == ''
    assert now_template_transformer.resolve_permit_package_file_tokens(None, {}) is None


def test_build_permit_package_file_label_map_without_now_application(db_session):
    """Legacy/CLI callers that don't have a now_application on hand pass None - this must be a
    safe no-op rather than an error."""
    assert now_template_transformer.build_permit_package_file_label_map(None) == {}


def test_replace_condition_value_with_data_resolves_permit_package_file_tokens(db_session):
    """The shared substitution function used both for document generation and at issuance should
    resolve {permit_package_file:<guid>} tokens to their live "1.N Title" text, alongside the
    existing known-variable substitution, and never leave the raw token in the output."""
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    doc = _add_permit_package_document(
        db_session, now_application, identity.mine, preamble_title='Site Map', final_package_order=1)
    guid = str(doc.now_application_document_xref_guid)

    # replace_condition_value_with_data matches known variable names as bare words anywhere in the text (not just inside braces).
    # The condition text below avoids using the literal word "mine_no" outside of its {mine_no} placeholder.
    condition = f"Value: {{mine_no}}. See {{permit_package_file:{guid}}} for details."
    condition_var = {"mine_no": "12345"}
    label_map = now_template_transformer.build_permit_package_file_label_map(now_application)

    result = now_template_transformer.replace_condition_value_with_data(
        condition, condition_var, label_map)

    assert result == "Value: 12345. See 1.2 Site Map for details."
    assert '{' not in result and '}' not in result


def test_replace_condition_value_with_data_broken_permit_package_file_token(db_session):
    identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
    now_application = identity.now_application
    label_map = now_template_transformer.build_permit_package_file_label_map(now_application)

    condition = "See {permit_package_file:00000000-0000-0000-0000-000000000000} for details."
    result = now_template_transformer.replace_condition_value_with_data(condition, {}, label_map)

    assert result == "See Reference unavailable for details."


def test_replace_condition_value_with_data_permit_package_file_token_without_label_map(db_session):
    """Existing callers that don't pass a label_map should keep stripping braces exactly as
    before this fix, rather than raising - this documents the intentional backwards-compatible
    fallback in resolve_permit_package_file_tokens."""
    condition = "See {permit_package_file:some-guid} for details."
    result = now_template_transformer.replace_condition_value_with_data(condition, {})
    assert result == "See permit_package_file:some-guid for details."