import json
import uuid

from tests.factories import VarianceFactory, MineFactory
from app.api.variances.models.variance import INVALID_MINE_GUID, INVALID_VARIANCE_GUID


class TestGetMineVariance:
    """GET /mines/{mine_guid}/variances/{variance_guid}"""

    def test_get_variance(self, test_client, db_session, auth_headers):
        """Should return the correct variance and a 200 response code"""

        variance = VarianceFactory()

        get_resp = test_client.get(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 200
        assert get_data['variance_guid'] == str(variance.variance_guid)
        assert get_data['variance_no'] == variance.variance_no


    def test_get_variance_invalid_variance_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 with relevant error message when an invalid variance guid is provided"""

        variance = VarianceFactory()

        get_resp = test_client.get(
            f'/mines/{variance.mine_guid}/variances/1234',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 400
        assert get_data['message'] == INVALID_VARIANCE_GUID


    def test_get_variances_invalid_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 with relevant error message when an invalid mine guid is provided"""

        variance = VarianceFactory()

        get_resp = test_client.get(
            f'/mines/abc123/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'])
        get_data = json.loads(get_resp.data.decode())
        assert get_resp.status_code == 400
        assert get_data['message'] == INVALID_MINE_GUID


    def test_get_variances_wrong_mine_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 when the variance does not exist on the provided mine"""

        variance = VarianceFactory()
        mine = MineFactory()

        get_resp = test_client.get(
            f'/mines/{mine.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'])
        assert get_resp.status_code == 404


class TestPutMineVariance:
    """PUT /mines/{mine_guid}/variances/{variance_guid}"""

    def test_put_variance(self, test_client, db_session, auth_headers):
        """Should return the updated variance record"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': approved_variance.note,
            'parties_notified_ind': True,
            'issue_date': approved_variance.issue_date,
            'expiry_date': approved_variance.expiry_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 200, put_resp.response
        assert put_data['compliance_article_id'] == data['compliance_article_id']
        assert put_data['received_date'] == data['received_date'].strftime('%Y-%m-%d')
        assert put_data['variance_application_status_code'] == data['variance_application_status_code']
        assert put_data['inspector_party_guid'] == str(data['inspector_party_guid'])
        assert put_data['note'] == data['note']
        assert put_data['parties_notified_ind'] == data['parties_notified_ind']
        assert put_data['issue_date'] == data['issue_date'].strftime('%Y-%m-%d')
        assert put_data['expiry_date'] == data['expiry_date'].strftime('%Y-%m-%d')


    def test_put_variance_application_non_existent_variance_guid(self, test_client, db_session, auth_headers):
        """Should return a 404 if the variance guid is not associated with a variance record"""

        fake_guid = uuid.uuid4()
        variance = VarianceFactory()
        data = {
            'note': 'This is my favourite variance.',
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{fake_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 404


    def test_put_variance_application_invalid_variance_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 if the variance guid is invalid"""

        variance = VarianceFactory()
        data = {
            'note': 'This is my favourite variance.',
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/1234',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400


    # Test the business logic
    def test_put_approved_variance_missing_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an expiry date"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': approved_variance.note,
            'issue_date': approved_variance.issue_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'expiry' in put_data['message'].lower()


    def test_put_approved_variance_missing_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an issue date"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'inspector_party_guid': approved_variance.inspector_party_guid,
            'note': approved_variance.note,
            'expiry_date': approved_variance.expiry_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'issue' in put_data['message'].lower()


    def test_put_approved_variance_missing_inspector_party_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is approved without an inspector"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        data = {
            'compliance_article_id': approved_variance.compliance_article_id,
            'received_date': approved_variance.received_date,
            'variance_application_status_code': approved_variance.variance_application_status_code,
            'note': approved_variance.note,
            'issue_date': approved_variance.issue_date,
            'expiry_date': approved_variance.expiry_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'inspector' in put_data['message'].lower()


    def test_put_denied_variance_missing_inspector_party_guid(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied without an inspector"""

        variance = VarianceFactory()
        denied_variance = VarianceFactory(denied=True)
        data = {
            'compliance_article_id': denied_variance.compliance_article_id,
            'received_date': denied_variance.received_date,
            'variance_application_status_code': denied_variance.variance_application_status_code,
            'note': denied_variance.note
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'inspector' in put_data['message'].lower()


    def test_put_denied_variance_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied with an expiry date"""

        variance = VarianceFactory()
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

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'expiry' in put_data['message'].lower()


    def test_put_denied_variance_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is denied with an issue date"""

        variance = VarianceFactory()
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

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'issue' in put_data['message'].lower()


    def test_put_variance_application_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is in-review with an expiry date"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        data = {
            'expiry_date': approved_variance.expiry_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'expiry' in put_data['message'].lower()


    def test_put_variance_application_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is in-review with an issue date"""

        variance = VarianceFactory()
        denied_variance = VarianceFactory(denied=True)
        approved_variance = VarianceFactory(approved=True)
        data = {
            'issue_date': approved_variance.issue_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'issue' in put_data['message'].lower()


    def test_put_not_applicable_variance_with_expiry_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is not-applicable with an expiry date"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        nap_variance = VarianceFactory(not_applicable=True)
        data = {
            'compliance_article_id': nap_variance.compliance_article_id,
            'received_date': nap_variance.received_date,
            'variance_application_status_code': nap_variance.variance_application_status_code,
            'note': nap_variance.note,
            'expiry_date': approved_variance.expiry_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'expiry' in put_data['message'].lower()


    def test_put_not_applicable_variance_with_issue_date(self, test_client, db_session, auth_headers):
        """Should return a 400 and a relevant error message if the variance is not-applicable with an issue date"""

        variance = VarianceFactory()
        approved_variance = VarianceFactory(approved=True)
        nap_variance = VarianceFactory(not_applicable=True)
        data = {
            'compliance_article_id': nap_variance.compliance_article_id,
            'received_date': nap_variance.received_date,
            'variance_application_status_code': nap_variance.variance_application_status_code,
            'note': nap_variance.note,
            'issue_date': approved_variance.issue_date
        }

        put_resp = test_client.put(
            f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}',
            headers=auth_headers['full_auth_header'],
            data=data)
        put_data = json.loads(put_resp.data.decode())
        assert put_resp.status_code == 400, put_resp.response
        assert 'issue' in put_data['message'].lower()
