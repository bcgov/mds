from datetime import datetime, timedelta
import uuid

import pytest

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.factories import create_mine_and_permit, MineDocumentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory


def test_permit_amendment_model_find_by_permit_amendment_id(db_session):
    mine, permit = create_mine_and_permit()

    permit_amendment = PermitAmendment.find_by_permit_amendment_id(
        permit.permit_amendments[0].permit_amendment_id)
    assert permit_amendment.permit_amendment_id == permit.permit_amendments[0].permit_amendment_id


def test_permit_amendment_model_find_by_permit_id(db_session):
    batch_size = 3
    mine, permit = create_mine_and_permit(num_permit_amendments=batch_size)
    permit_id = mine.mine_permit[0].permit_id

    permit_amendments = PermitAmendment.find_by_permit_id(permit_id)
    assert len(permit_amendments) == batch_size
    assert all(pa.permit_id == permit_id for pa in permit_amendments)


def test_permit_amendment_model_find_last_amendment_by_permit_id(db_session):
    batch_size = 3
    mine, permit = create_mine_and_permit(num_permit_amendments=batch_size)
    permit_id = mine.mine_permit[0].permit_id

    permit_amendment = PermitAmendment.find_last_amendment_by_permit_id(permit_id)
    assert permit_amendment.permit_id == permit_id


def test_permit_amendment_model_validate_status_code():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment status code is not provided.' in str(e.value)


def test_permit_amendment_model_validate_type_code():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment type code is not provided.' in str(e.value)


def test_permit_model_validate_received_date():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today() + timedelta(days=1),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment received date cannot be set to the future.' in str(e.value)


def test_permit_model_validate_issue_date(db_session):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today() + timedelta(days=1),
            authorization_end_date=datetime.today())
    assert 'Permit amendment issue date cannot be set to the future.' in str(e.value)


def test_permit_amendment_model_now_application_documents_excludes_archived(db_session):
    mine, permit = create_mine_and_permit()
    permit_amendment = permit.permit_amendments[0]
    now_application_identity = NOWApplicationIdentityFactory(mine=mine)
    permit_amendment.now_application_guid = now_application_identity.now_application_guid
    for document_name, is_archived in [('active-map.pdf', False), ('archived-map.pdf', True)]:
        mine_document = MineDocumentFactory(mine=mine, document_name=document_name, is_archived=is_archived)
        db_session.add(NOWApplicationDocumentXref(
            now_application_id=now_application_identity.now_application_id,
            mine_document_guid=mine_document.mine_document_guid,
            now_application_document_type_code='MPW'))
    db_session.commit()

    assert [doc.mine_document.document_name for doc in permit_amendment.now_application_documents] == ['active-map.pdf']
