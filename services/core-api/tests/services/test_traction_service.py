from flask import current_app
from unittest.mock import MagicMock, patch

from app.api.services.traction_service import TractionService

from tests.factories import create_mine_and_permit


def test_get_token_on_init(test_client, db_session, auth_headers):
    with current_app.test_request_context() as a, patch(
        "app.api.services.traction_service.TractionService.get_new_token"
    ) as mock:
        traction_svc = TractionService()
        mock.assert_called_once()
        assert traction_svc.token


def test_create_oob_connection_invitation(test_client, db_session, auth_headers):
    mine, permit = create_mine_and_permit()
    with current_app.test_request_context() as a, patch(
        "app.api.services.traction_service.TractionService.get_new_token"
    ) as mock_get_token, patch(
        "requests.post"
    ) as mock_post:
        mock_post.return_value = MagicMock(json=MagicMock(return_value={"invitation":{"key":"value"}}))
        traction_svc = TractionService()
        mock_get_token.assert_called_once()
        traction_svc.create_oob_connection_invitation(mine.mine_guid, mine.mine_name)
        mock_post.assert_called_once() 
        assert traction_svc.token
