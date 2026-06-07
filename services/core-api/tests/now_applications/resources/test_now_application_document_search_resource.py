from unittest.mock import patch

from tests.now_application_factories import NOWApplicationIdentityFactory


def test_post_now_application_document_search(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.search'
    ) as mock_search:
        mock_search.return_value = [b'event: documents\ndata: {"results": []}\n\n']

        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search',
            json={'query': 'test'},
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.mimetype == 'text/event-stream'
