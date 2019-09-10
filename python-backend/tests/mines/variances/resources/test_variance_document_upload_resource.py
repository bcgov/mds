import pytest
import json
import uuid

from tests.status_code_gen import RandomVarianceDocumentCategoryCode
from tests.factories import (VarianceFactory, MineFactory, MineDocumentFactory,
                             VarianceDocumentFactory)


# PUT
def test_put_file(test_client, db_session, auth_headers):
    mine = MineFactory()
    variance = VarianceFactory(mine=mine)
    document_count = len(variance.documents)
    data = {
        'document_manager_guid': uuid.uuid4(),
        'document_name': 'my_document.pdf',
        'variance_document_category_code': RandomVarianceDocumentCategoryCode()
    }

    put_resp = test_client.put(
        f'/mines/{mine.mine_guid}/variances/{variance.variance_guid}/documents',
        headers=auth_headers['full_auth_header'],
        data=data)
    put_data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200, put_resp.response
    assert len(put_data['documents']) == document_count + 1


# DELETE
def test_file_removal(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    variance_document = variance.documents[0]
    document_count = len(variance.documents)
    assert variance_document is not None

    delete_resp = test_client.delete(
        f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}/documents/{variance_document.mine_document_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204
    assert len(variance.documents) == document_count - 1


def test_file_removal_not_on_variance(test_client, db_session, auth_headers):
    variance = VarianceFactory()
    mine_document_guid = MineDocumentFactory().mine_document_guid

    delete_resp = test_client.delete(
        f'/mines/{variance.mine_guid}/variances/{variance.variance_guid}/documents/{mine_document_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 404
