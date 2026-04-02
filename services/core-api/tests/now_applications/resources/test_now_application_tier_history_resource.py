import json
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationTierFactory
from tests.status_code_gen import RandomNoticeOfWorkTierCode

def test_get_now_application_tier_history_success(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    application = now_application_identity.now_application
    tier = NOWApplicationTierFactory(now_application=application)
    
    # Trigger a change
    tier.notice_of_work_tier_code = RandomNoticeOfWorkTierCode()
    db_session.add(tier)
    db_session.commit()
    
    tier.notice_of_work_tier_code = RandomNoticeOfWorkTierCode()
    db_session.add(tier)
    db_session.commit()

    get_resp = test_client.get(
        f'/now-applications/{now_application_identity.now_application_guid}/tier-history',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data) >= 1
    assert 'updated_by' in get_data[0]
    assert 'updated_at' in get_data[0]
    assert 'changeset' in get_data[0]

def test_get_now_application_tier_history_not_found(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/now-applications/11111111-1111-1111-1111-111111111111/tier-history',
        headers=auth_headers['full_auth_header'])
    assert get_resp.status_code == 404
