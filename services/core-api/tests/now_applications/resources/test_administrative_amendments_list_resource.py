import json, pytest
from datetime import datetime

from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineFactory, MineDocumentFactory


class TestApplicationResource:
    """GET /now-applications/"""
    def test_get_now_application_success(self, test_client, db_session, auth_headers):
        num_created = 3
        NOWApplicationIdentityFactory.create_batch(size=num_created, application_type_code='ADA')

        get_resp = test_client.get(f'/now-applications', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == num_created

    def test_get_ada_application_success_filter_by_guid(self, test_client, db_session,
                                                        auth_headers):
        num_created = 3
        NOWApplicationlist = NOWApplicationIdentityFactory.create_batch(
            size=num_created, application_type_code='ADA')

        get_resp = test_client.get(
            f'/now-applications?mine_guid={NOWApplicationlist[0].mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 1

    """POST /now-applications/"""

    def test_post_administrative_amendment_application_success(self, test_client, db_session,
                                                               auth_headers):
        mine = MineFactory(mine_permit_amendments=1)
        permit = mine.mine_permit[0]
        permit_amendment = permit.permit_amendments[0]

        payload = {
            'mine_guid': mine.mine_guid,
            'permit_id': permit.permit_id,
            'permit_amendment_guid': permit_amendment.permit_amendment_guid,
            'received_date': "2021-01-01",
            'application_reason_codes': ['EXT', 'CHP', 'MYA'],
            'application_source_type_code': "PRI"
        }

        post_resp = test_client.post(
            f'/now-applications/administrative-amendments',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response

class TestAdministrativeAmendmentDocuments:
    """POST /now-applications/administrative-amendments copies the source application's permit package documents"""

    def test_archived_permit_package_documents_are_not_copied(self, test_client, db_session, auth_headers):
        mine = MineFactory(mine_permit_amendments=1)
        permit = mine.mine_permit[0]
        permit_amendment = permit.permit_amendments[0]
        now_application_identity = NOWApplicationIdentityFactory(mine=mine)
        permit_amendment.now_application_guid = now_application_identity.now_application_guid
        for document_name, is_archived in [('active.pdf', False), ('archived.pdf', True)]:
            # The mine-level archive endpoint doesn't remove a document from the permit package
            mine_document = MineDocumentFactory(mine=mine, document_name=document_name)
            if is_archived:
                mine_document.is_archived = True
                mine_document.archived_date = datetime.utcnow()
            db_session.add(NOWApplicationDocumentXref(
                now_application_id=now_application_identity.now_application_id,
                mine_document_guid=mine_document.mine_document_guid,
                now_application_document_type_code='OTH',
                is_final_package=True,
                final_package_order=1))
        db_session.commit()

        post_resp = test_client.post(
            f'/now-applications/administrative-amendments',
            json={
                'mine_guid': str(mine.mine_guid),
                'permit_id': permit.permit_id,
                'permit_amendment_guid': str(permit_amendment.permit_amendment_guid),
                'received_date': "2021-01-01",
                'application_reason_codes': ['EXT'],
                'application_source_type_code': "PRI"
            },
            headers=auth_headers['full_auth_header'])

        assert post_resp.status_code == 201, post_resp.data
        new_application_identity = NOWApplicationIdentity.find_by_guid(post_resp.json['now_application_guid'])
        copied_xrefs = NOWApplicationDocumentXref.query.filter_by(
            now_application_id=new_application_identity.now_application_id).all()
        assert [xref.mine_document.document_name for xref in copied_xrefs] == ['active.pdf']
