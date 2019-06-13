import json
import uuid

from tests.factories import VarianceFactory, MineFactory, PartyFactory
from tests.status_code_gen import RandomComplianceArticleId
from app.api.utils.custom_reqparser import DEFAULT_MISSING_REQUIRED


class TestGetMineVariances:
    """GET /mines/{mine_guid}/variances"""

    def test_get_variances_for_a_mine(self, test_client, db_session, auth_headers):
        """Should return the correct number of records and a 200 staus code"""

        batch_size = 3
        mine = MineFactory(minimal=True)
        VarianceFactory.create_batch(size=batch_size, mine=mine)
        VarianceFactory.create_batch(size=batch_size)

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/variances', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert len(get_data['records']) == batch_size


    def test_get_variances_invalid_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 when an invalid mine guid is provided"""

        batch_size = 3
        VarianceFactory.create_batch(size=batch_size)

        get_resp = test_client.get(f'/mines/abc123/variances', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 400


    def test_get_variances_non_existent_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        batch_size = 3
        fake_guid = uuid.uuid4()
        VarianceFactory.create_batch(size=batch_size)

        get_resp = test_client.get(f'/mines/{fake_guid}/variances', headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 404


class TestPostMineVariance:
    """POST /mines/{mine_guid}/variances"""

    def test_post_variance_application(self, test_client, db_session, auth_headers):
        """Should return the new variance application record"""

        mine = MineFactory()
        party = PartyFactory(person=True)
        test_variance_data = {
            'compliance_article_id': RandomComplianceArticleId(),
            'note': 'Biggest mine yet',
            'received_date': '2019-04-23',
            'applicant_guid': party.party_guid
        }
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/variances',
            data=test_variance_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 200, post_resp.response
        assert post_data['compliance_article_id'] == test_variance_data['compliance_article_id']
        assert post_data['note'] == test_variance_data['note']
        assert post_data['received_date'] == test_variance_data['received_date']
        assert post_data['applicant_guid'] == str(test_variance_data['applicant_guid'])


    def test_post_approved_variance(self, test_client, db_session, auth_headers):
        """Should return the new variance record with all possible values set"""

        approved_variance = VarianceFactory(approved=True)
        test_variance_data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': 'Biggest mine yet',
            'parties_notified_ind': approved_variance.parties_notified_ind,
            'issue_date': approved_variance.issue_date,
            'expiry_date': approved_variance.expiry_date
        }
        post_resp = test_client.post(
            f'/mines/{approved_variance.mine_guid}/variances',
            data=test_variance_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 200, post_resp.response
        assert post_data['compliance_article_id'] == test_variance_data['compliance_article_id']
        assert post_data['received_date'] == test_variance_data['received_date'].strftime('%Y-%m-%d')
        assert post_data['variance_application_status_code'] == test_variance_data[
            'variance_application_status_code']
        assert post_data['inspector_party_guid'] == str(test_variance_data['inspector_party_guid'])
        assert post_data['note'] == test_variance_data['note']
        assert post_data['issue_date'] == test_variance_data['issue_date'].strftime('%Y-%m-%d')
        assert post_data['expiry_date'] == test_variance_data['expiry_date'].strftime('%Y-%m-%d')


    def test_post_variance_missing_compliance_article_id(self, test_client, db_session, auth_headers):
        """Should return a 400 with a missing parameter message when no compliance article is provided"""

        mine = MineFactory()
        test_variance_data = {
            "note": "Biggest mine yet",
            "issue_date": "2019-04-23",
            "received_date": "2019-04-23",
            "expiry_date": "2019-04-23",
        }
        post_resp = test_client.post(
            f'/mines/{mine.mine_guid}/variances',
            data=test_variance_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert DEFAULT_MISSING_REQUIRED in post_data['message']


    def test_post_variance_non_existent_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the provided mine guid does not exist"""

        fake_guid = uuid.uuid4()
        party = PartyFactory(person=True)
        test_variance_data = {
            'compliance_article_id': RandomComplianceArticleId(),
            'note': 'Biggest mine yet',
            'received_date': '2019-04-23',
            'applicant_guid': party.party_guid
        }
        post_resp = test_client.post(
            f'/mines/{fake_guid}/variances',
            data=test_variance_data,
            headers=auth_headers['full_auth_header'])
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 404, post_resp.response


    # Test the business logic
    def test_post_approved_variance_missing_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an expiry date"""

        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': approved_variance.note,
            'issue_date': approved_variance.issue_date
        }

        post_resp = test_client.post(
            f'/mines/{approved_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'expiry' in post_data['message'].lower()


    def test_post_approved_variance_missing_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an issue date"""

        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': approved_variance.note,
            'expiry_date': approved_variance.expiry_date
        }

        post_resp = test_client.post(
            f'/mines/{approved_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'issue' in post_data['message'].lower()


    def test_post_approved_variance_missing_inspector_party_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an inspector"""

        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'note': approved_variance.note,
            'issue_date': approved_variance.issue_date,
            'expiry_date': approved_variance.expiry_date
        }

        post_resp = test_client.post(
            f'/mines/{approved_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'inspector' in post_data['message'].lower()


    def test_post_denied_variance_missing_inspector_party_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied without an inspector"""

        denied_variance = VarianceFactory(denied=True)
        data = {
            'compliance_article_id': denied_variance.compliance_article_id,
            'received_date': denied_variance.received_date,
            'variance_application_status_code': denied_variance.variance_application_status_code,
            'note': denied_variance.note
        }

        post_resp = test_client.post(
            f'/mines/{denied_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'inspector' in post_data['message'].lower()


    def test_post_denied_variance_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied with an expiry date"""

        approved_variance = VarianceFactory(approved=True)
        denied_variance = VarianceFactory(denied=True)
        data = {
            'compliance_article_id': denied_variance.compliance_article_id,
            'received_date': denied_variance.received_date,
            'variance_application_status_code': denied_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': denied_variance.note,
            'expiry_date': approved_variance.expiry_date
        }

        post_resp = test_client.post(
            f'/mines/{denied_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'expiry' in post_data['message'].lower()


    def test_post_denied_variance_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied with an issue date"""

        denied_variance = VarianceFactory(denied=True)
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': denied_variance.compliance_article_id,
            'received_date': denied_variance.received_date,
            'variance_application_status_code': denied_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': denied_variance.note,
            'issue_date': approved_variance.issue_date
        }

        post_resp = test_client.post(
            f'/mines/{denied_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'issue' in post_data['message'].lower()


    def test_post_variance_application_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is in-review with an expiry date"""

        variance = VarianceFactory()
        party = PartyFactory(person=True)
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': variance.compliance_article_id,
            'note': variance.note,
            'received_date': variance.received_date,
            'applicant_guid': party.party_guid,
            'expiry_date': approved_variance.expiry_date
        }

        post_resp = test_client.post(
            f'/mines/{variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'expiry' in post_data['message'].lower()


    def test_post_variance_application_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is in-review with an issue date"""

        variance = VarianceFactory()
        party = PartyFactory(person=True)
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': variance.compliance_article_id,
            'note': variance.note,
            'received_date': variance.received_date,
            'applicant_guid': party.party_guid,
            'issue_date': approved_variance.issue_date
        }

        post_resp = test_client.post(
            f'/mines/{variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'issue' in post_data['message'].lower()


    def test_post_not_applicable_variance_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is not-applicable with an expiry date"""

        approved_variance = VarianceFactory(approved=True)
        nap_variance = VarianceFactory(not_applicable=True)
        data = {
            'compliance_article_id': nap_variance.compliance_article_id,
            'received_date': nap_variance.received_date,
            'variance_application_status_code': nap_variance.variance_application_status_code,
            'note': nap_variance.note,
            'expiry_date': approved_variance.expiry_date
        }

        post_resp = test_client.post(
            f'/mines/{nap_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'expiry' in post_data['message'].lower()


    def test_post_not_applicable_variance_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is not-applicable with an issue date"""

        approved_variance = VarianceFactory(approved=True)
        nap_variance = VarianceFactory(not_applicable=True)
        data = {
            'compliance_article_id': nap_variance.compliance_article_id,
            'received_date': nap_variance.received_date,
            'variance_application_status_code': nap_variance.variance_application_status_code,
            'note': nap_variance.note,
            'issue_date': approved_variance.issue_date
        }

        post_resp = test_client.post(
            f'/mines/{nap_variance.mine_guid}/variances',
            headers=auth_headers['full_auth_header'],
            data=data)
        post_data = json.loads(post_resp.data.decode())
        assert post_resp.status_code == 400, post_resp.response
        assert 'issue' in post_data['message'].lower()
