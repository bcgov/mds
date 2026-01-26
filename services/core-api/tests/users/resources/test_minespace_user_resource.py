import json, uuid
from datetime import datetime
from pytz import utc
from unittest.mock import patch
from tests.factories import MineFactory, MinespaceUserFactory, MinespaceSubscriptionFactory
from tests.helpers import subscribe_minespace_user
from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
from app.api.users.minespace.models.minespace_user_role_xref import MinespaceUserRoleXref
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine

def test_get_minespace_users_all(test_client, db_session, auth_headers):
    user_email = MinespaceUserFactory().bceid_username

    get_resp = test_client.get('/users/minespace', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['records']) == 1
    assert get_data['records'][0]['bceid_username'] == user_email


def test_get_minespace_user_by_id(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace/{user.user_id}', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['bceid_username'] == user.bceid_username


def test_get_minespace_user_by_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    get_resp = test_client.get(
        f'/users/minespace?email={user.bceid_username}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert get_data['records'][0]['bceid_username'] == user.bceid_username


def test_post_minespace_user_duplicate_email(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()

    data = {'bceid_username': user.bceid_username, "mine_guids": [str(uuid.uuid4())]}
    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_email_too_long(test_client, db_session, auth_headers):
    data = {'bceid_username': 'a' * 255 + "@bceid", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 400, post_resp.response
    assert json.loads(post_resp.data.decode())["message"], post_resp.response


def test_post_minespace_user_new_email(test_client, db_session, auth_headers):
    data = {'bceid_username': "new_email@bceid", "mine_guids": [str(uuid.uuid4())]}

    post_resp = test_client.post(
        '/users/minespace', json=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200, post_resp.response
    assert json.loads(post_resp.data.decode())['bceid_username'] == data['bceid_username']


def test_delete_minespace_success(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    user.sub = "deleteuser@bceid"
    user.save()
    
    mine = MineFactory()
    
    # Create role xref and mine subscription
    role_xref = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=False
    )
    role_xref.save()
    
    MinespaceSubscriptionFactory(mine=mine, minespace_user=user)
    
    # Create access request
    request = MinespaceUserRequest(
        user_sub=user.sub,
        minespace_user_id=user.user_id,
        role_requested="PMT",
        business_name="Deleted User Business",
        request_status=1,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request.save()
    
    with patch('app.api.users.minespace.models.minespace_user.CSSService') as mock_css:
        mock_css.get_roles_by_user.return_value = ['mds_minespace_proponents']
        mock_css.delete_user_role_mapping.return_value = True
        
        del_resp = test_client.delete(
            f'/users/minespace/{user.user_id}',
            headers=auth_headers['full_auth_header']
        )
        
        assert del_resp.status_code == 204
        
        # Verify keycloak access was revoked before deletion
        mock_css.get_roles_by_user.assert_called_once_with(user.sub)
        mock_css.delete_user_role_mapping.assert_called()
        
        # Verify user was soft deleted
        db_session.refresh(user)
        assert user.deleted_ind == True


def test_delete_minespace_not_found(test_client, db_session, auth_headers):
    del_resp = test_client.delete(
        '/users/minespace/11112233', headers=auth_headers['full_auth_header'])
    assert del_resp.status_code == 404, del_resp.response


def test_update_minespace_user_mines_success(test_client, db_session, auth_headers):
    
    user = MinespaceUserFactory()
    mine = MineFactory()
    email = user.bceid_username
    mine_guids = [str(mine.mine_guid)]

    data = {
    "bceid_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 200, put_resp.response
    decoded_resp = json.loads(put_resp.data)
    mines = decoded_resp['mines']

    assert mines[0] == str(mine.mine_guid)
    assert len(mines) == 1
    

def test_update_minespace_user_empty_mine_list(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    
    email = user.bceid_username
    mine_guids = []

    data = {
    "bceid_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 400, put_resp.response


def test_update_minespace_user_mine_does_not_exist(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    email = user.bceid_username
    mine_guids = [str(uuid.uuid4())]

    data = {
    "bceid_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/{user.user_id}', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 404, put_resp.response

def test_update_minespace_user_does_not_exist(test_client, db_session, auth_headers):
    
    email = "test@email.com"
    mine_guids = [str(uuid.uuid4())]

    data = {
    "bceid_username": f"{email}",
    "mine_guids": mine_guids
    }

    put_resp = test_client.put(f'/users/minespace/1', json=data, 
    headers=auth_headers['full_auth_header'])

    assert put_resp.status_code == 404, put_resp.response

def test_get_minespace_users_by_mine_guid(test_client, db_session, auth_headers):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()

    mine = MineFactory(minimal=True)

    # the user that performs the action
    test_user = subscribe_minespace_user(db_session, mine)

    MinespaceSubscriptionFactory(mine=mine, minespace_user=user1)
    MinespaceSubscriptionFactory(mine=mine, minespace_user=user2)

    # test that proponent can access, verify data correct
    get_resp_proponent = test_client.get(
        f'/users/minespace?mine_guid={mine.mine_guid}',
        headers=auth_headers['proponent_only_auth_header'])
    get_data = json.loads(get_resp_proponent.data.decode())
    assert get_resp_proponent.status_code == 200, get_resp_proponent.response

    user_names = sorted([x['bceid_username'] for x in get_data['records']])
    expected_names = sorted([user1.bceid_username, user2.bceid_username, test_user.bceid_username])
    assert user_names == expected_names

    # test that view only can access
    get_resp_view = test_client.get(
        f'/users/minespace?mine_guid={mine.mine_guid}',
        headers=auth_headers['view_only_auth_header'])
    assert get_resp_view.status_code == 200, get_resp_view.response

def test_get_minespace_users_no_mine_guid_bad_request(test_client, db_session, auth_headers):
    # minespace user cannot access GET resource without specifying mine_guid
    get_resp_proponent = test_client.get(
        f'/users/minespace',
        headers=auth_headers['proponent_only_auth_header'])
    assert get_resp_proponent.status_code == 400, get_resp_proponent.response
    get_data = json.loads(get_resp_proponent.data.decode())
    assert get_data['message'] == "400 Bad Request: mine_guid is a required argument"


def test_update_minespace_user_approve_full_access(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    user.sub = "approveuser@bceid"
    user.save()
    
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    # Create pending access request
    request = MinespaceUserRequest(
        user_sub=user.sub,
        minespace_user_id=user.user_id,
        role_requested="PMT",
        business_name="Test Mining Corp",
        request_status=0,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request.save()
    
    # Create pending role xrefs
    role_xref1 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=True
    )
    role_xref1.save()
    
    role_xref2 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine2.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=True
    )
    role_xref2.save()
    
    # approval - approve access request and all roles
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine1.mine_guid), str(mine2.mine_guid)],
        "user_roles": [
            {
                "minespace_user_role_xref_guid": str(role_xref1.minespace_user_role_xref_guid),
                "mine_guid": str(mine1.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": False
            },
            {
                "minespace_user_role_xref_guid": str(role_xref2.minespace_user_role_xref_guid),
                "mine_guid": str(mine2.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": False
            }
        ],
        "access_request": {
            "request_status": 1
        }
    }
    
    with patch('app.api.users.minespace.models.minespace_user.CSSService') as mock_css:
        mock_css.assign_roles_to_user.return_value = True
        
        put_resp = test_client.put(
            f'/users/minespace/{user.user_id}',
            json=data,
            headers=auth_headers['full_auth_header']
        )
        
        assert put_resp.status_code == 200
        
        # Verify access request was approved
        db_session.refresh(request)
        assert request.request_status == 1
        
        # Verify keycloak access was granted
        mock_css.assign_roles_to_user.assert_called_once()
        
        # Verify all roles were approved
        db_session.refresh(role_xref1)
        db_session.refresh(role_xref2)
        assert role_xref1.is_pending == False
        assert role_xref2.is_pending == False


def test_update_minespace_user_reject_removes_all_access(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    user.sub = "rejectuser@bceid"
    user.save()
    
    mine1 = MineFactory()
    mine2 = MineFactory()
    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user)
    MinespaceSubscriptionFactory(mine=mine2, minespace_user=user)
    
    # Create pending access request
    request = MinespaceUserRequest(
        user_sub=user.sub,
        minespace_user_id=user.user_id,
        role_requested="MMG",
        business_name="Rejected Business",
        request_status=0,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request.save()
    
    # Create pending and approved role xrefs
    role_xref1 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="MMG",
        is_pending=True
    )
    role_xref1.save()
    
    role_xref2 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine2.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=False
    )
    role_xref2.save()
    
    # Realistic rejection - remove all access
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine1.mine_guid), str(mine2.mine_guid)],
        "access_request": {
            "request_status": 2
        }
    }
    
    with patch('app.api.users.minespace.models.minespace_user.CSSService') as mock_css:
        mock_css.get_roles_by_user.return_value = ['mds_minespace_proponents']
        mock_css.delete_user_role_mapping.return_value = True
        
        put_resp = test_client.put(
            f'/users/minespace/{user.user_id}',
            json=data,
            headers=auth_headers['full_auth_header']
        )
        
        assert put_resp.status_code == 200
        
        # Verify access request was rejected
        db_session.refresh(request)
        assert request.request_status == 2
        
        # Verify keycloak access was revoked
        mock_css.get_roles_by_user.assert_called_once()
        mock_css.delete_user_role_mapping.assert_called()
        
        # Verify ALL role xrefs were deleted (both pending and approved)
        db_session.refresh(role_xref1)
        db_session.refresh(role_xref2)
        assert role_xref1.deleted_ind == True
        assert role_xref2.deleted_ind == True
        
        # Verify all mine relationships were removed
        mine_subs = MinespaceUserMine.query.filter_by(
            user_id=user.user_id
        ).all()
        assert len(mine_subs) == 0


def test_update_minespace_user_partial_role_approval(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    mine1 = MineFactory()
    mine2 = MineFactory()
    mine3 = MineFactory()
    
    # approve some roles, keep others pending
    # User has 3 pending roles for different mines
    role_xref1 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=True
    )
    role_xref1.save()
    
    role_xref2 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine2.mine_guid,
        minespace_user_role_code="MMG",
        is_pending=True
    )
    role_xref2.save()
    
    role_xref3 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine3.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=True
    )
    role_xref3.save()
    
    # Admin approves role1 and role2, keeps role3 pending for verification
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine1.mine_guid), str(mine2.mine_guid), str(mine3.mine_guid)],
        "user_roles": [
            {
                "minespace_user_role_xref_guid": str(role_xref1.minespace_user_role_xref_guid),
                "mine_guid": str(mine1.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": False  # Approved
            },
            {
                "minespace_user_role_xref_guid": str(role_xref2.minespace_user_role_xref_guid),
                "mine_guid": str(mine2.mine_guid),
                "minespace_user_role_code": "MMG",
                "is_pending": False  # Approved
            },
            {
                "minespace_user_role_xref_guid": str(role_xref3.minespace_user_role_xref_guid),
                "mine_guid": str(mine3.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": True  # Still pending
            }
        ]
    }
    
    put_resp = test_client.put(
        f'/users/minespace/{user.user_id}',
        json=data,
        headers=auth_headers['full_auth_header']
    )
    
    assert put_resp.status_code == 200
    
    # Verify selective approval
    db_session.refresh(role_xref1)
    db_session.refresh(role_xref2)
    db_session.refresh(role_xref3)
    
    assert role_xref1.is_pending == False
    assert role_xref2.is_pending == False
    assert role_xref3.is_pending == True


def test_update_minespace_user_add_new_role_to_existing_user(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    # User already has approved PMT role for mine1
    existing_role = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=False
    )
    existing_role.save()
    
    MinespaceSubscriptionFactory(mine=mine1, minespace_user=user)
    
    # Admin adds new MMG role for mine2
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine1.mine_guid), str(mine2.mine_guid)],
        "user_roles": [
            {
                "minespace_user_role_xref_guid": str(existing_role.minespace_user_role_xref_guid),
                "mine_guid": str(mine1.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": False
            },
            {
                # New role - no guid
                "mine_guid": str(mine2.mine_guid),
                "minespace_user_role_code": "MMG",
                "is_pending": False
            }
        ]
    }
    
    put_resp = test_client.put(
        f'/users/minespace/{user.user_id}',
        json=data,
        headers=auth_headers['full_auth_header']
    )
    
    assert put_resp.status_code == 200
    
    # Verify new role was created
    all_roles = MinespaceUserRoleXref.query.filter_by(
        minespace_user_id=user.user_id,
        deleted_ind=False
    ).all()
    
    assert len(all_roles) == 2
    
    mmg_role = next((r for r in all_roles if r.minespace_user_role_code == 'MMG'), None)
    assert mmg_role is not None
    assert str(mmg_role.mine_guid) == str(mine2.mine_guid)
    assert mmg_role.is_pending == False


def test_update_minespace_user_remove_role(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    # User has two roles
    role1 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine1.mine_guid,
        minespace_user_role_code="PMT",
        is_pending=False
    )
    role1.save()
    
    role2 = MinespaceUserRoleXref(
        minespace_user_id=user.user_id,
        mine_guid=mine2.mine_guid,
        minespace_user_role_code="MMG",
        is_pending=False
    )
    role2.save()
    
    # Admin removes role2, keeps only role1
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine1.mine_guid), str(mine2.mine_guid)],
        "user_roles": [
            {
                "minespace_user_role_xref_guid": str(role1.minespace_user_role_xref_guid),
                "mine_guid": str(mine1.mine_guid),
                "minespace_user_role_code": "PMT",
                "is_pending": False
            }
            # role2 not included - should be deleted
        ]
    }
    
    put_resp = test_client.put(
        f'/users/minespace/{user.user_id}',
        json=data,
        headers=auth_headers['full_auth_header']
    )
    
    assert put_resp.status_code == 200
    
    # Verify role2 was soft-deleted
    db_session.refresh(role1)
    db_session.refresh(role2)
    
    assert role1.deleted_ind == False
    assert role2.deleted_ind == True


def test_update_minespace_user_roles_with_invalid_mine(test_client, db_session, auth_headers):
    user = MinespaceUserFactory()
    mine = MineFactory()
    invalid_guid = str(uuid.uuid4())
    
    data = {
        "bceid_username": user.bceid_username,
        "mine_guids": [str(mine.mine_guid)],
        "user_roles": [
            {
                "mine_guid": invalid_guid,
                "minespace_user_role_code": "PMT",
                "is_pending": False
            }
        ]
    }
    
    put_resp = test_client.put(
        f'/users/minespace/{user.user_id}',
        json=data,
        headers=auth_headers['full_auth_header']
    )
    
    assert put_resp.status_code == 404


def test_get_minespace_users_include_rejected(test_client, db_session, auth_headers):
    user1 = MinespaceUserFactory()
    user2 = MinespaceUserFactory()
    
    # Create rejected request for user1
    request1 = MinespaceUserRequest(
        user_sub="user1@bceid",
        minespace_user_id=user1.user_id,
        role_requested="PMT",
        business_name="Business 1",
        request_status=2,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request1.save()
    
    # Without include_rejected, user1 should not be returned but user2 should
    get_resp = test_client.get(
        '/users/minespace',
        headers=auth_headers['full_auth_header']
    )
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    user_ids = [u['user_id'] for u in data['records']]
    assert user1.user_id not in user_ids
    assert user2.user_id in user_ids
    
    # With include_rejected=true, both user1 and user2 should be returned
    get_resp = test_client.get(
        '/users/minespace?include_rejected=true',
        headers=auth_headers['full_auth_header']
    )
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    user_ids = [u['user_id'] for u in data['records']]
    assert user1.user_id in user_ids
    assert user2.user_id in user_ids
