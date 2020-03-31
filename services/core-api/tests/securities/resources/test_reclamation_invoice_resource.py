import json

from tests.factories import ReclamationInvoiceFactory, MineFactory, PermitFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

GOOD_RECLAMATION_INVOICE_POST_DATA = {
    "reclamation_invoice": {
        "project_id": "1234567",
        "amount": 42,
        "vendor": "Joe The Tree Planter",
        "documents": []
    }
}

BAD_RECLAMATION_INVOICE_POST_DATA = {
    "reclamation_invoice": {
        "project_id": "1234567",
        "vendor": "Joe The Tree Planter",
        "foo": "bar",
        "documents": []
    }
}

BAD_GUID = "ffe7442f-716b-4bad-a1d4-7f171d75a6bc"


class TestReclamationInvoiceResource:
    """GET Reclamation Invoices"""
    def test_get_all_reclamation_invoices_on_mine(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        mine = MineFactory(minimal=True)
        permits = PermitFactory.create_batch(size=batch_size, mine=mine)
        reclamation_invoices = [
            reclamation_invoice for permit in permits
            for reclamation_invoice in permit.reclamation_invoices
        ]

        get_resp = test_client.get(
            f'/securities/reclamation-invoices?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == len(reclamation_invoices)
        assert all(
            str(reclamation_invoice.reclamation_invoice_guid) in map(
                lambda x: x['reclamation_invoice_guid'], get_data['records'])
            for reclamation_invoice in reclamation_invoices)

    def test_get_all_reclamation_invoices_on_mine_no_mine_guid(self, test_client, db_session,
                                                               auth_headers):
        """Should return empty list"""

        get_resp = test_client.get(
            f'/securities/reclamation-invoices?mine_guid={BAD_GUID}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 0

    def test_get_all_reclamation_invoices_on_mine_no_permits(self, test_client, db_session,
                                                             auth_headers):
        """Should return empty list"""

        mine = MineFactory(minimal=True)
        get_resp = test_client.get(
            f'/securities/reclamation-invoices?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 0

    def test_get_reclamation_invoice_by_id(self, test_client, db_session, auth_headers):
        """Should return a specific reclamation invoice"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        reclamation_invoice = permit.reclamation_invoices[0]
        get_resp = test_client.get(
            f'/securities/reclamation-invoices/{reclamation_invoice.reclamation_invoice_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['reclamation_invoice_guid'] == str(
            reclamation_invoice.reclamation_invoice_guid)

    def test_get_reclamation_invoice_with_bad_id(self, test_client, db_session, auth_headers):
        """Should return 404 and an error"""

        get_resp = test_client.get(
            f'/securities/reclamation-invoices/{BAD_GUID}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['message'] is not None

    """POST Reclamation Invoice Tests"""

    def test_post_a_reclamation_invoice(self, test_client, db_session, auth_headers):
        """Should return the created reclamation invoice with a 201 response code"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        GOOD_RECLAMATION_INVOICE_POST_DATA['permit_guid'] = permit.permit_guid

        post_resp = test_client.post(
            '/securities/reclamation-invoices',
            json=GOOD_RECLAMATION_INVOICE_POST_DATA,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['permit_guid'] == str(permit.permit_guid)

    def test_post_a_reclamation_invoice_bad_permit_guid(self, test_client, db_session,
                                                        auth_headers):
        """Should return an error and a 400 response code"""

        GOOD_RECLAMATION_INVOICE_POST_DATA['permit_guid'] = BAD_GUID

        post_resp = test_client.post(
            '/securities/reclamation-invoices',
            json=GOOD_RECLAMATION_INVOICE_POST_DATA,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None

    def test_post_a_reclamation_invoice_bad_data(self, test_client, db_session, auth_headers):
        """Should return an error and a 400 response code"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        BAD_RECLAMATION_INVOICE_POST_DATA['permit_guid'] = permit.permit_guid

        post_resp = test_client.post(
            '/securities/reclamation-invoices',
            json=BAD_RECLAMATION_INVOICE_POST_DATA,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None

    """PUT Reclamation Invoice Tests"""

    def test_put_a_reclamation_invoice(self, test_client, db_session, auth_headers):
        """Should return the edited reclamation invoice with a 200 response code"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        reclamation_invoice = permit.reclamation_invoices[0]
        old_amount = reclamation_invoice.amount
        old_vendor = reclamation_invoice.vendor

        data = {
            "project_id": "DUCK-467985",
            "amount": 999999.99,
            "vendor": "Rubber Ducky Restoration Services",
            "documents": []
        }

        post_resp = test_client.put(
            f'/securities/reclamation-invoices/{reclamation_invoice.reclamation_invoice_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['amount'] != str(old_amount)
        assert post_data['vendor'] != old_vendor

    def test_put_a_reclamation_invoice_missing_data(self, test_client, db_session, auth_headers):
        """Should return 400 response code with an error"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        reclamation_invoice = permit.reclamation_invoices[0]

        data = {
            "project_id": "DUCK-467985",
            "vendor": "Rubber Ducky Restoration Services",
            "documents": []
        }

        post_resp = test_client.put(
            f'/securities/reclamation-invoices/{reclamation_invoice.reclamation_invoice_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None
