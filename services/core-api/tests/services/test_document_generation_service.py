import json, uuid, requests, pytest, os
from flask import current_app

from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.document_generation.models.document_template import DocumentTemplate


def test_missing_template_returns_fail(test_client, db_session, auth_headers):
    with current_app.test_request_context():
        template_path = os.path.join(current_app.root_path,
                                     DocumentTemplate.query.get('NRL').template_file_path)

        file_download_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, {'mine_no': '1234456'})

        assert file_download_resp.status_code == 200

        assert file_download_resp.headers['Content-Transfer-Encoding'] == 'binary'
        assert file_download_resp.headers['Content-Disposition'].find('.pdf') != -1
        assert file_download_resp.headers['Content-Type'] == 'application/pdf'
        assert int(file_download_resp.headers['Content-Length']) > 50000