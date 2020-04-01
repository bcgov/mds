import json

from tests.factories import BondFactory, MineFactory, PermitFactory, PartyFactory
from app.api.now_applications.resources.now_application_list_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT

BOND_POST_DATA = {
    "bond": {
        "amount": 15.56,
        "bond_type_code": "CAS",
        "bond_status_code": "ACT",
        "reference_number": "#test",
        "issue_date": "2020-03-18T00:00:00",
        "institution_name": "BMO",
        "institution_street": "123 test st",
        "institution_city": "Test City",
        "institution_province": "BC",
        "institution_postal_code": "T3S 0T0",
        "note": "Testing 123",
        "project_id": "#123 Testing"
    }
}

BOND_POST_BAD_DATA = {
    "bond": {
        "amount": 15.56,
        "bond_type_code": "CAS",
        "reference_number": "#test",
        "institution_name": "BMO",
        "institution_street": "123 test st",
        "institution_city": "Test City",
        "institution_province": "BC",
        "institution_postal_code": "T3S 0T0",
        "note": "Testing 123",
        "project_id": "#123 Testing"
    }
}

BAD_GUID = "ffe7442f-716b-4bad-a1d4-7f171d75a6bc"


class TestBondsResource:
    """GET /securities/bonds"""
    def test_get_all_bonds_on_mine(self, test_client, db_session, auth_headers):
        """Should return the correct records with a 200 response code"""

        batch_size = 5
        mine = MineFactory(minimal=True)
        permits = PermitFactory.create_batch(size=batch_size, mine=mine)
        bonds = [bond for permit in permits for bond in permit.bonds]

        get_resp = test_client.get(
            f'/securities/bonds?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())

        assert len(get_data['records']) == len(bonds)
        assert all(
            str(bond.bond_guid) in map(lambda x: x['bond_guid'], get_data['records'])
            for bond in bonds)

    def test_get_all_bonds_on_mine_no_mine_guid(self, test_client, db_session, auth_headers):
        """Should return empty list"""

        get_resp = test_client.get(
            f'/securities/bonds?mine_guid={BAD_GUID}', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 0

    def test_get_all_bonds_on_mine_no_permits(self, test_client, db_session, auth_headers):
        """Should return empty list"""

        mine = MineFactory(minimal=True)
        get_resp = test_client.get(
            f'/securities/bonds?mine_guid={mine.mine_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert len(get_data['records']) == 0

    def test_get_bond_by_id(self, test_client, db_session, auth_headers):
        """Should return a specific bond"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        bond = permit.bonds[0]
        get_resp = test_client.get(
            f'/securities/bonds/{bond.bond_guid}', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 200, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['bond_guid'] == str(bond.bond_guid)

    def test_get_bond_with_bad_id(self, test_client, db_session, auth_headers):
        """Should return 404 and an error"""

        get_resp = test_client.get(
            f'/securities/bonds/{BAD_GUID}', headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404, get_resp.response
        get_data = json.loads(get_resp.data.decode())
        assert get_data['message'] is not None

    """POST BONDS"""

    def test_post_a_bond(self, test_client, db_session, auth_headers):
        """Should return the created bond with a 201 response code"""

        mine = MineFactory(minimal=True)
        party1 = PartyFactory(person=True)
        permit = PermitFactory(mine=mine)
        BOND_POST_DATA['bond']['payer_party_guid'] = party1.party_guid
        BOND_POST_DATA['permit_guid'] = permit.permit_guid

        post_resp = test_client.post(
            '/securities/bonds', json=BOND_POST_DATA, headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 201, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['permit_guid'] == str(permit.permit_guid)
        assert post_data['payer_party_guid'] == str(party1.party_guid)

    def test_post_a_bond_bad_permit_guid(self, test_client, db_session, auth_headers):
        """Should return an error and a 400 response code"""

        party1 = PartyFactory(person=True)
        BOND_POST_DATA['bond']['payer_party_guid'] = party1.party_guid
        BOND_POST_DATA['permit_guid'] = BAD_GUID

        post_resp = test_client.post(
            '/securities/bonds', json=BOND_POST_DATA, headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None

    def test_post_a_bond_bad_data(self, test_client, db_session, auth_headers):
        """Should return an error and a 400 response code"""

        mine = MineFactory(minimal=True)
        party1 = PartyFactory(person=True)
        permit = PermitFactory(mine=mine)
        BOND_POST_BAD_DATA['bond']['payer_party_guid'] = party1.party_guid
        BOND_POST_BAD_DATA['permit_guid'] = permit.permit_guid

        post_resp = test_client.post(
            '/securities/bonds', json=BOND_POST_BAD_DATA, headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None

    """PUT BONDS"""

    def test_put_a_bond(self, test_client, db_session, auth_headers):
        """Should return the edited bond with a 200 response code"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        bond = permit.bonds[0]
        old_amount = bond.amount
        old_status = bond.bond_status_code

        data = {
            "amount": 5000010.00,
            "bond_type_code": "CAS",
            "payer_party_guid": str(bond.payer_party_guid),
            "bond_status_code": "ACT" if "ACT" != old_status else "REL",
            "reference_number": "#test"
        }

        post_resp = test_client.put(
            f'/securities/bonds/{bond.bond_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 200, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['amount'] != str(old_amount)
        assert post_data['bond_status_code'] != old_status

    def test_put_a_bond_missing_data(self, test_client, db_session, auth_headers):
        """Should return 400 response code with an error"""

        mine = MineFactory(minimal=True)
        permit = PermitFactory(mine=mine)
        bond = permit.bonds[0]

        data = {
            "amount": 5000010.00,
            "bond_type_code": "CAS",
            "bond_status_code": "ACT",
            "reference_number": "#test"
        }

        post_resp = test_client.put(
            f'/securities/bonds/{bond.bond_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert post_resp.status_code == 400, post_resp.response
        post_data = json.loads(post_resp.data.decode())
        assert post_data['message'] is not None
