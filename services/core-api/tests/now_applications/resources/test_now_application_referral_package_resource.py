import json
import uuid
from datetime import datetime
from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineDocumentFactory
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.now_application_referral_package import NOWApplicationReferralPackage


def _make_document_xref(now_application_identity):
    mine_doc = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code='OTH')
    return mine_doc, xref


class TestNOWApplicationReferralPackageResource:
    """GET & POST /now-applications/{application_guid}/referral-packages"""

    def test_get_referral_packages_empty(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()

        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 200
        data = json.loads(resp.data.decode())
        assert data['records'] == []

    def test_post_create_referral_package(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        payload = {
            'mine_document_guids': [str(mine_doc.mine_document_guid)]
        }

        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 201
        data = json.loads(resp.data.decode())
        assert data['package_order'] == 1
        assert data['package_name'] == 'Referral Package #1'
        assert len(data['documents']) == 1
        doc = data['documents'][0]
        assert doc['mine_document_guid'] == str(mine_doc.mine_document_guid)
        assert doc['version_number'] == 1
        assert doc['version_label'] == 'v1'
        assert doc['category'] == 'Other'

    def test_post_referral_package_duplicate_suppression(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        payload = {
            'mine_document_guids': [str(mine_doc.mine_document_guid)]
        }

        resp1 = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert resp1.status_code == 201
        data1 = json.loads(resp1.data.decode())

        # Second call immediately after should return the same package without creating a duplicate
        resp2 = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json=payload,
            headers=auth_headers['full_auth_header'])
        assert resp2.status_code == 201
        data2 = json.loads(resp2.data.decode())
        assert data2['now_application_referral_package_guid'] == data1['now_application_referral_package_guid']
        assert data2['package_order'] == 1

        # Check GET returns only 1 package
        get_resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 1

    def test_post_referral_package_not_found(self, test_client, db_session, auth_headers):
        resp = test_client.post(
            '/now-applications/00000000-0000-0000-0000-000000000000/referral-packages',
            json={'mine_document_guids': []},
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 404

    def test_post_referral_package_invalid_guid(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json={'mine_document_guids': ['not-a-uuid']},
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 400

    def test_post_referral_package_unknown_document(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json={'mine_document_guids': ['00000000-0000-0000-0000-000000000000']},
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 404

    def test_post_referral_package_document_from_other_application(self, test_client, db_session,
                                                                   auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        other_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(other_identity)
        db_session.add(xref)
        db_session.commit()

        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/referral-packages',
            json={'mine_document_guids': [str(mine_doc.mine_document_guid)]},
            headers=auth_headers['full_auth_header'])
        assert resp.status_code == 404

    def test_package_order_not_reused_after_delete(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()
        url = f'/now-applications/{now_application_identity.now_application_guid}/referral-packages'
        payload = {'mine_document_guids': [str(mine_doc.mine_document_guid)]}

        other_doc, other_xref = _make_document_xref(now_application_identity)
        db_session.add(other_xref)
        db_session.commit()

        NOWApplicationReferralPackage.create(now_application_identity.now_application, [mine_doc])
        second = NOWApplicationReferralPackage.create(
            now_application_identity.now_application, [mine_doc, other_doc])
        assert second.package_order == 2
        second.deleted_ind = True
        second.save()

        payload = {'mine_document_guids': [str(mine_doc.mine_document_guid), str(other_doc.mine_document_guid)]}
        resp = test_client.post(url, json=payload, headers=auth_headers['full_auth_header'])
        assert resp.status_code == 201
        assert json.loads(resp.data.decode())['package_order'] == 3

    def test_document_manager_version_guid_resolved_by_timestamp(self, db_session):
        from app.api.mines.documents.models.mine_document_version import MineDocumentVersion
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        package = NOWApplicationReferralPackage.create(
            now_application_identity.now_application, [mine_doc])
        snap = package.documents[0]
        # Still the current file: no archived version yet
        assert snap.document_manager_version_guid is None

        # Replace the file the same way create_from_docman_version does
        archived_guid = uuid.uuid4()
        version = MineDocumentVersion(
            mine_document_guid=mine_doc.mine_document_guid,
            document_manager_version_guid=archived_guid,
            document_name=mine_doc.document_name)
        version.create_timestamp = mine_doc.create_timestamp
        version.save()
        mine_doc.create_timestamp = datetime.utcnow()
        mine_doc.save()
        db_session.refresh(mine_doc)

        assert snap.document_manager_version_guid == str(archived_guid)

    def test_new_package_created_when_documents_change(self, db_session):
        from app.api.mines.documents.models.mine_document_version import MineDocumentVersion
        now_application_identity = NOWApplicationIdentityFactory()
        now_application = now_application_identity.now_application
        doc_a, xref_a = _make_document_xref(now_application_identity)
        doc_b, xref_b = _make_document_xref(now_application_identity)
        db_session.add_all([xref_a, xref_b])
        db_session.commit()

        first = NOWApplicationReferralPackage.create(now_application, [doc_a])
        assert NOWApplicationReferralPackage.create(now_application, [doc_a]) is first

        # Different document set
        second = NOWApplicationReferralPackage.create(now_application, [doc_a, doc_b])
        assert second.package_order == 2

        # New version of an existing document
        MineDocumentVersion(
            mine_document_guid=doc_a.mine_document_guid,
            document_manager_version_guid=uuid.uuid4(),
            document_name=doc_a.document_name).save()
        db_session.refresh(doc_a)
        third = NOWApplicationReferralPackage.create(now_application, [doc_a, doc_b])
        assert third.package_order == 3
        assert {d.version_number for d in third.documents} == {1, 2}
