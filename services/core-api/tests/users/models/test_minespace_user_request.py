from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
from tests.factories import MinespaceUserFactory, MineFactory


def test_find_by_user_sub_existing(db_session):
    user_sub = "test_user_123@bceid"
    mine1 = MineFactory()
    mine2 = MineFactory()
    
    # complete permittee form submission with mines
    MinespaceUserRequest.create_or_update_request(
        user_sub=user_sub,
        data={
            "role_requested": "PMT",
            "business_name": "Test Mining Corp",
            "mines": [mine1.mine_guid, mine2.mine_guid]
        },
        is_submitting=True
    )
    
    found = MinespaceUserRequest.find_by_user_sub(user_sub)
    assert found is not None
    assert found.user_sub == user_sub
    assert found.role_requested == "PMT"


def test_find_by_user_sub_not_found(db_session):
    found = MinespaceUserRequest.find_by_user_sub("nonexistent@bceid")
    assert found is None


def test_create_request_permittee_complete(db_session):
    user_sub = "permittee@bceid"
    mine = MineFactory()
    
    # Scenario 2a: Permittee complete submission
    # Required: role, business_name, mines (no authorization documents needed)
    data = {
        "role_requested": "PMT",
        "business_name": "ABC Mining Corp",
        "mines": [mine.mine_guid]
    }
    
    result = MinespaceUserRequest.create_or_update_request(
        user_sub=user_sub,
        data=data,
        is_submitting=True
    )
    
    assert result is not None
    assert result.user_sub == user_sub
    assert result.role_requested == "PMT"
    assert result.business_name == "ABC Mining Corp"
    assert result.submitted_timestamp is not None


def test_create_request_manager_with_documents(db_session):
    user_sub = "manager_docs@bceid"
    mine = MineFactory()
    
    # Scenario 2b: Manager with authorization letter (Choice A)
    # Required: role, business_name, mines, documents
    data = {
        "role_requested": "MMG",
        "business_name": "Mine Management Services Ltd",
        "mines": [mine.mine_guid],
        "documents": [
            {"document_name": "authorization_letter.pdf", "document_manager_guid": "doc-guid-1"}
        ]
    }
    
    result = MinespaceUserRequest.create_or_update_request(
        user_sub=user_sub,
        data=data,
        is_submitting=True
    )
    
    assert result is not None
    assert result.role_requested == "MMG"
    assert result.business_name == "Mine Management Services Ltd"
    assert result.submitted_timestamp is not None


def test_create_request_manager_with_permittee_contact(db_session):
    user_sub = "manager_contact@bceid"
    mine = MineFactory()
    
    # Scenario 2c: Manager with permittee contact (Choice B authorization)
    # Required: role, business_name, mines, permittee.business, permittee.name, permittee.email, permittee.phone
    permittee_data = {
        "business": "XYZ Mining Ltd",
        "name": "John Permittee",
        "email": "john@xyzmining.com",
        "phone": "250-555-1234"
    }
    data = {
        "role_requested": "MMG",
        "business_name": "Mine Management Services Ltd",
        "mines": [mine.mine_guid],
        "permittee": permittee_data
    }
    
    result = MinespaceUserRequest.create_or_update_request(
        user_sub=user_sub,
        data=data,
        is_submitting=True
    )
    
    assert result.permittee is not None
    assert result.permittee["business"] == "XYZ Mining Ltd"
    assert result.permittee["name"] == "John Permittee"
    assert result.permittee["email"] == "john@xyzmining.com"
    assert result.permittee["phone"] == "250-555-1234"
    assert result.submitted_timestamp is not None


def test_create_request_administrator_with_delegation_letter(db_session):
    user_sub = "admin@bceid"
    mine = MineFactory()
    
    # Scenario 2d: Administrator with delegation letter
    # Required: role, business_name, mines, delegation_letter (passed as documents)
    data = {
        "role_requested": "ADM",
        "business_name": "Mining Administration Co",
        "mines": [mine.mine_guid],
        "documents": [
            {"document_name": "delegation_letter.pdf", "document_manager_guid": "deleg-123"}
        ]
    }
    
    result = MinespaceUserRequest.create_or_update_request(
        user_sub=user_sub,
        data=data,
        is_submitting=True
    )
    
    assert result.role_requested == "ADM"
    assert result.submitted_timestamp is not None


def test_link_to_user(db_session):
    user = MinespaceUserFactory()
    mine = MineFactory()
    
    # Create request with minimum required fields for permittee
    request = MinespaceUserRequest.create_or_update_request(
        user_sub="test@bceid",
        data={
            "role_requested": "PMT",
            "business_name": "Test Mining",
            "mines": [mine.mine_guid]
        },
        is_submitting=True
    )
    
    assert request.minespace_user_id is None
    
    request.link_to_user(user.user_id)
    
    assert request.minespace_user_id == user.user_id
