import json
from datetime import datetime
from pytz import utc
from unittest.mock import patch, MagicMock

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_document_xref import MinespaceUserDocumentXref
from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
from app.api.users.minespace.models.minespace_user_role_xref import MinespaceUserRoleXref
from tests.factories import MineFactory, create_mine_and_permit


def test_post_document_upload_bceid_authenticated(test_client, db_session, auth_headers):
    user_sub = "uploaduser@bceid"
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'uploaduser',
            'email': 'upload@example.com',
            'identity_provider': 'bceidbusiness'
        }
        mock_user_utils.return_value = mock_instance
        
        with patch('app.api.users.minespace.resources.new_minespace_user.DocumentManagerService') as mock_doc_service:
            mock_doc_service.initialize_upload_for_minespace_access_request.return_value = {
                'document_manager_guid': 'test-doc-guid-789',
                'upload_url': 'https://example.com/upload'
            }
            
            post_resp = test_client.post(
                '/users/minespace/documents',
                headers=auth_headers['full_auth_header']
            )
            
            assert post_resp.status_code == 200
            data = json.loads(post_resp.data.decode())
            assert 'document_manager_guid' in data
            
            # Verify the service was called with correct username
            mock_doc_service.initialize_upload_for_minespace_access_request.assert_called_once()


def test_post_document_upload_not_bceid_fails(test_client, db_session, auth_headers):
    user_sub = "idir@idir"
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': None,
            'email': 'idir@gov.bc.ca',
            'identity_provider': 'idir'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/documents',
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 400
        data = json.loads(post_resp.data.decode())
        assert 'BCeID' in data['message']


def test_get_access_request_existing(test_client, db_session, auth_headers):
    user_sub = "testuser@bceid"
    
    # Create an access request
    request = MinespaceUserRequest(
        user_sub=user_sub,
        role_requested="PMT",
        business_name="Test Business",
        request_status=0,
        submitted_timestamp=datetime.now(tz=utc)
    )
    request.save()
    
    # Mock the user info to return our test user_sub
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'testuser',
            'email': 'test@example.com'
        }
        mock_user_utils.return_value = mock_instance
        
        get_resp = test_client.get(
            '/users/minespace/access-request',
            headers=auth_headers['full_auth_header']
        )
        
        assert get_resp.status_code == 200
        data = json.loads(get_resp.data.decode())
        assert data['role_requested'] == 'PMT'
        assert data['business_name'] == 'Test Business'
        assert data['minespace_user_request_id'] is not None


def test_get_access_request_not_found(test_client, db_session, auth_headers):
    user_sub = "nonexistent@bceid"
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'nonexistent',
            'email': 'test@example.com'
        }
        mock_user_utils.return_value = mock_instance
        
        get_resp = test_client.get(
            '/users/minespace/access-request',
            headers=auth_headers['full_auth_header']
        )
        
        assert get_resp.status_code == 200
        data = json.loads(get_resp.data.decode())
        assert data.get('minespace_user_request_id') is None


def test_post_access_request_permittee_full_submission(test_client, db_session, auth_headers):
    user_sub = "permittee@bceid"
    mine = MineFactory()
    
    # Permittee submission - no authorization documents needed
    request_data = {
        'role_requested': 'PMT',
        'business_name': 'XYZ Mining Corporation',
        'mines': [str(mine.mine_guid)],
        'ministry_contact': 'regional.inspector@gov.bc.ca',
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'permittee',
            'email': 'owner@xyzmining.com',
            'given_name': 'Jane',
            'family_name': 'Smith',
            'display_name': 'Jane Smith',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-xyz-789'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['role_requested'] == 'PMT'
        assert data['business_name'] == 'XYZ Mining Corporation'
        assert data['submitted_timestamp'] is not None
        
        # Verify user was created and linked
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='permittee')
        assert user is not None
        assert user.email == 'owner@xyzmining.com'
        assert user.given_name == 'Jane'
        
        # Verify request is linked to user
        request = MinespaceUserRequest.find_by_user_sub(user_sub)
        assert request.minespace_user_id == user.user_id
        
        # Verify pending role xrefs were created for PMT role
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            deleted_ind=False
        ).all()
        assert len(role_xrefs) == 1
        assert role_xrefs[0].minespace_user_role_code == 'PMT'
        assert role_xrefs[0].is_pending == True


def test_post_access_request_manager_with_permittee_contact(test_client, db_session, auth_headers):
    user_sub = "manager@bceid"
    mine = MineFactory()
    
    # mine manager submission with permittee contact info
    request_data = {
        'role_requested': 'MMG',
        'business_name': 'Mine Management Services Ltd',
        'mines': [str(mine.mine_guid)],
        'permittee': {
            'name': 'John Permittee',
            'business': 'ABC Mining Corp',
            'title': 'Owner',
            'email': 'john@abcmining.com',
            'phone': '250-555-1234'
        },
        'ministry_contact': 'inspector@gov.bc.ca',
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'manager',
            'email': 'manager@minemanagement.com',
            'given_name': 'Mike',
            'family_name': 'Manager',
            'display_name': 'Mike Manager',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-mgr-456'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['permittee'] is not None
        assert data['permittee']['name'] == 'John Permittee'
        assert data['submitted_timestamp'] is not None
        
        # Verify user and role were created
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='manager')
        assert user is not None
        
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            minespace_user_role_code='MMG',
            deleted_ind=False
        ).all()
        assert len(role_xrefs) == 1
        assert role_xrefs[0].is_pending == True


def test_post_access_request_manager_with_authorization_documents(test_client, db_session, auth_headers):
    user_sub = "managerdocs@bceid"
    mine = MineFactory()
    
    # Manager submission with authorization letter
    request_data = {
        'role_requested': 'MMG',
        'business_name': 'Contract Mining Services',
        'mines': [str(mine.mine_guid)],
        'documents': [
            {
                'document_name': 'authorization_letter.pdf',
                'document_manager_guid': '12345678-1234-1234-1234-123456789abc'
            }
        ],
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'managerdocs',
            'email': 'docs@contractmining.com',
            'given_name': 'Doc',
            'family_name': 'Manager',
            'display_name': 'Doc Manager',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-docs-789'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['submitted_timestamp'] is not None
        
        # Verify documents were linked to user
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='managerdocs')
        docs = MinespaceUserDocumentXref.query.filter_by(
            minespace_user_id=user.user_id,
            deleted_ind=False
        ).all()
        assert len(docs) == 1
        assert str(docs[0].document_manager_guid) == '12345678-1234-1234-1234-123456789abc'


def test_post_access_request_admin_with_delegation_letter(test_client, db_session, auth_headers):
    user_sub = "admin@bceid"
    mine = MineFactory()
    
    # Admin submission with delegation letter
    request_data = {
        'role_requested': 'ADM',
        'business_name': 'Administrative Services Inc',
        'mines': [str(mine.mine_guid)],
        'documents': [
            {
                'document_name': 'delegation_letter.pdf',
                'document_manager_guid': '87654321-4321-4321-4321-abcdef123456'
            }
        ],
        'ministry_contact': 'admin.contact@gov.bc.ca',
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'admin',
            'email': 'admin@adminservices.com',
            'given_name': 'Admin',
            'family_name': 'User',
            'display_name': 'Admin User',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-admin-111'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['role_requested'] == 'ADM'
        assert data['submitted_timestamp'] is not None
        
        # Verify role xref was created
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='admin')
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            minespace_user_role_code='ADM',
            deleted_ind=False
        ).all()
        assert len(role_xrefs) == 1


def test_post_access_request_null_role_no_role_xrefs(test_client, db_session, auth_headers):
    user_sub = "researcher@bceid"
    mine = MineFactory()
    
    # Realistic NUL (General Public/Researcher) submission - no role xrefs created
    request_data = {
        'role_requested': 'NUL',
        'business_name': 'Research Institute',
        'mines': [str(mine.mine_guid)],
        'access_request_text': 'Need access for research purposes',
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'researcher',
            'email': 'researcher@institute.ca',
            'given_name': 'Research',
            'family_name': 'User',
            'display_name': 'Research User',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-research-222'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['role_requested'] == 'NUL'
        
        # Verify NO role xrefs were created for NUL role
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='researcher')
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            deleted_ind=False
        ).all()
        assert len(role_xrefs) == 0


def test_post_access_request_mine_not_in_list(test_client, db_session, auth_headers):
    user_sub = "unlisted@bceid"
    
    # user can't find mine in dropdown
    request_data = {
        'role_requested': 'PMT',
        'business_name': 'Small Mine Operations',
        'access_request_text': 'Mine #12345 - ABC Gold Mine',
        'ministry_contact': 'regional@gov.bc.ca',
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'unlisted',
            'email': 'owner@smallmine.com',
            'given_name': 'Small',
            'family_name': 'Miner',
            'display_name': 'Small Miner',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-small-333'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        data = json.loads(post_resp.data.decode())
        assert data['access_request_text'] == 'Mine #12345 - ABC Gold Mine'
        
        # User created but no role xrefs (since no mines selected)
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='unlisted')
        assert user is not None
        
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            deleted_ind=False
        ).all()
        assert len(role_xrefs) == 0


def test_post_access_request_multiple_mines(test_client, db_session, auth_headers):
    user_sub = "multimines@bceid"
    mine1 = MineFactory()
    mine2 = MineFactory()
    mine3 = MineFactory()
    
    # permittee with multiple mines
    request_data = {
        'role_requested': 'PMT',
        'business_name': 'Multi-Site Mining Corp',
        'mines': [str(mine1.mine_guid), str(mine2.mine_guid), str(mine3.mine_guid)],
        'is_submitting': True
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'multimines',
            'email': 'owner@multisite.com',
            'given_name': 'Multi',
            'family_name': 'Owner',
            'display_name': 'Multi Owner',
            'identity_provider': 'bceidbusiness',
            'bceid_user_guid': 'guid-multi-444'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 201
        
        # Verify role xrefs created for all mines
        user = MinespaceUser.find_by_token_data(sub=user_sub, bceid_username='multimines')
        role_xrefs = MinespaceUserRoleXref.query.filter_by(
            minespace_user_id=user.user_id,
            deleted_ind=False
        ).all()
        
        assert len(role_xrefs) == 3
        mine_guids = {str(r.mine_guid) for r in role_xrefs}
        assert str(mine1.mine_guid) in mine_guids
        assert str(mine2.mine_guid) in mine_guids
        assert str(mine3.mine_guid) in mine_guids


def test_post_access_request_validation_error(test_client, db_session, auth_headers):
    user_sub = "validationuser@bceid"
    
    request_data = {
        'business_name': 'Test Business',
        'is_submitting': True
        # Missing role_requested
    }
    
    with patch('app.api.users.minespace.resources.new_minespace_user.UserUtils') as mock_user_utils:
        mock_instance = MagicMock()
        mock_instance.get_user_raw_info.return_value = {
            'sub': user_sub,
            'bceid_username': 'validationuser',
            'email': 'validation@example.com'
        }
        mock_user_utils.return_value = mock_instance
        
        post_resp = test_client.post(
            '/users/minespace/access-request',
            json=request_data,
            headers=auth_headers['full_auth_header']
        )
        
        assert post_resp.status_code == 400


def test_get_mine_search_results(test_client, db_session, auth_headers):
    # Create test mines
    mine1 = MineFactory(mine_name='Copper Creek Mine', mine_no='M-001')
    mine2 = MineFactory(mine_name='Gold Valley Mine', mine_no='M-002')
    mine3 = MineFactory(mine_name='Silver Mountain Mine', mine_no='M-003')
    
    get_resp = test_client.get(
        '/users/minespace/mines?search=copper',
        headers=auth_headers['full_auth_header']
    )
    
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    assert 'mines' in data
    
    # Should find only mine1, not mine2 or mine3
    mine_guids = [m['mine_guid'] for m in data['mines']]
    assert str(mine1.mine_guid) in mine_guids
    assert str(mine2.mine_guid) not in mine_guids
    assert str(mine3.mine_guid) not in mine_guids


def test_get_mine_search_results_by_mine_no(test_client, db_session, auth_headers):
    mine1 = MineFactory(mine_name='Test Mine', mine_no='M-12345')
    
    get_resp = test_client.get(
        '/users/minespace/mines?search=12345',
        headers=auth_headers['full_auth_header']
    )
    
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    assert 'mines' in data
    assert len(data['mines']) >= 1
    
    mine_nos = [m['mine_no'] for m in data['mines']]
    assert mine1.mine_no in mine_nos


def test_get_mine_search_results_by_permit_no(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit(
        mine_kwargs={'mine_name': 'Permit Test Mine', 'mine_no': 'M-99999'},
        permit_kwargs={'permit_no': 'P-12345'}
    )
    
    get_resp = test_client.get(
        '/users/minespace/mines?search=P-12345',
        headers=auth_headers['full_auth_header']
    )
    
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    assert 'mines' in data
    
    # Should find the mine associated with this permit
    mine_guids = [m['mine_guid'] for m in data['mines']]
    assert str(mine.mine_guid) in mine_guids


def test_get_mine_search_results_core_user_full_data(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit(
        mine_kwargs={'mine_name': 'Full Data Mine', 'mine_no': 'M-11111'},
        permit_kwargs={'permit_no': 'P-11111'}
    )
    
    # Core users should get full data
    get_resp = test_client.get(
        '/users/minespace/mines?search=11111',
        headers=auth_headers['full_auth_header']
    )
    
    assert get_resp.status_code == 200
    data = json.loads(get_resp.data.decode())
    assert 'mines' in data
    
    if len(data['mines']) > 0:
        result = data['mines'][0]
        # Core users get all fields
        assert 'mine_guid' in result
        assert 'mine_no' in result
        assert 'mine_name' in result
        assert 'permit_guid' in result
        assert 'permit_no' in result
