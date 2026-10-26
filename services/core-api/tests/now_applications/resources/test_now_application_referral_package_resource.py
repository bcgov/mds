import json
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
