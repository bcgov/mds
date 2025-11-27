
import uuid
from datetime import datetime, timedelta

from app.api.now_applications.models.now_application_document_type import (
    NOWApplicationDocumentType,
)
from app.api.now_applications.models.now_application_document_xref import (
    NOWApplicationDocumentXref,
)
from app.cli_commands.export_permit_conditions import get_final_issued_permit_document
from app.extensions import db
from tests.factories import (
    MineDocumentFactory,
    NOWApplicationIdentityFactory,
    PermitAmendmentDocumentFactory,
    PermitAmendmentFactory,
    create_mine_and_permit,
)


def create_now_document(now_application, mine, doc_type_code, created_at=None, document_manager_guid=None):
    if not document_manager_guid:
        document_manager_guid = uuid.uuid4()
        
    mine_doc = MineDocumentFactory(
        mine=mine,
        document_manager_guid=document_manager_guid,
        document_name=f"test_doc_{doc_type_code}.pdf"
    )
    
    # Manually set create_timestamp if provided (AuditMixin usually handles this)
    if created_at:
        mine_doc.create_timestamp = created_at
        mine_doc.save()

    xref = NOWApplicationDocumentXref(
        now_application_id=now_application.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code=doc_type_code
    )
    now_application.documents.append(xref)
    now_application.save()
    return xref

def test_get_final_issued_permit_document_no_now(db_session):
    """Test returns None if no NoW application linked"""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    assert get_final_issued_permit_document(amendment) is None

def test_get_final_issued_permit_document_no_docs(db_session):
    """Test returns None if NoW has no PMT/PMA documents"""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    now_identity = NOWApplicationIdentityFactory(mine=mine)
    amendment.now_application_identity = now_identity
    amendment.save()
    
    assert get_final_issued_permit_document(amendment) is None

def test_get_final_issued_permit_document_draft_only(db_session):
    """Test returns None if no issued documents exist"""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    now_identity = NOWApplicationIdentityFactory(mine=mine)
    amendment.now_application_identity = now_identity
    amendment.save()
    
    now_app = now_identity.now_application

    # Create two draft PMT documents
    date1 = datetime.utcnow() - timedelta(days=2)
    date2 = datetime.utcnow() - timedelta(days=1)
    
    doc1 = create_now_document(now_app, mine, 'PMT', created_at=date1)
    doc2 = create_now_document(now_app, mine, 'PMT', created_at=date2)
    
    # Should return None
    result = get_final_issued_permit_document(amendment)
    assert result is None

def test_get_final_issued_permit_document_issued_match(db_session):
    """Test returns issued document if it matches one in related_documents"""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    now_identity = NOWApplicationIdentityFactory(mine=mine)
    amendment.now_application_identity = now_identity
    amendment.save()
    
    now_app = now_identity.now_application

    # Create a draft doc (latest timestamp)
    draft_date = datetime.utcnow()
    draft_doc = create_now_document(now_app, mine, 'PMT', created_at=draft_date)

    # Create an issued doc (earlier timestamp)
    issued_date = datetime.utcnow() - timedelta(days=1)
    issued_doc_guid = uuid.uuid4()
    issued_doc_xref = create_now_document(now_app, mine, 'PMT', created_at=issued_date, document_manager_guid=issued_doc_guid)

    # Link issued doc to amendment.related_documents
    PermitAmendmentDocumentFactory(
        permit_amendment=amendment,
        document_manager_guid=issued_doc_guid,
        document_name="Issued Permit.pdf"
    )

    # Should return issued_doc_xref even though draft_doc is newer
    result = get_final_issued_permit_document(amendment)
    assert result.mine_document_guid == issued_doc_xref.mine_document_guid

def test_get_final_issued_permit_document_multiple_issued(db_session):
    """Test returns latest issued document if multiple match"""
    mine, permit = create_mine_and_permit()
    amendment = permit.permit_amendments[0]
    now_identity = NOWApplicationIdentityFactory(mine=mine)
    amendment.now_application_identity = now_identity
    amendment.save()
    
    now_app = now_identity.now_application

    # Issued doc 1
    date1 = datetime.utcnow() - timedelta(days=2)
    guid1 = uuid.uuid4()
    xref1 = create_now_document(now_app, mine, 'PMT', created_at=date1, document_manager_guid=guid1)
    PermitAmendmentDocumentFactory(permit_amendment=amendment, document_manager_guid=guid1)

    # Issued doc 2 (Latest)
    date2 = datetime.utcnow() - timedelta(days=1)
    guid2 = uuid.uuid4()
    xref2 = create_now_document(now_app, mine, 'PMT', created_at=date2, document_manager_guid=guid2)
    PermitAmendmentDocumentFactory(permit_amendment=amendment, document_manager_guid=guid2)

    # Should return xref2
    result = get_final_issued_permit_document(amendment)
    assert result.mine_document_guid == xref2.mine_document_guid
