import json
from tests.factories import MineFactory
from tests.status_code_gen import RandomRequiredDocument

from app.api.required_documents.models.required_documents import RequiredDocument


# GET
def test_get_all_required_documents(test_client, db_session, auth_headers):
    get_resp = test_client.get('/documents/required', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['required_documents']) == len(RequiredDocument.query.all())


def test_get_required_document_by_guid(test_client, db_session, auth_headers):
    req_guid = RandomRequiredDocument().req_document_guid

    get_resp = test_client.get('/documents/required/' + str(req_guid),
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert get_data['req_document_guid'] == str(req_guid)


def test_get_all_required_documents_by_category(test_client, db_session, auth_headers):
    cat = 'TSF'

    get_resp = test_client.get('/documents/required?category=' + cat,
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['required_documents']) == len(
        RequiredDocument.query.filter_by(req_document_category=cat).all())
    assert all(rd['req_document_category'] == cat for rd in get_data['required_documents'])


def test_get_all_required_documents_by_category_and_sub_category(test_client, db_session,
                                                                 auth_headers):
    cat = 'TSF'
    sub_cat = 'INI'

    get_resp = test_client.get(f'/documents/required?category={cat}&sub_category={sub_cat}',
                               headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['required_documents']) == len(
        RequiredDocument.query.filter_by(req_document_category=cat,
                                         req_document_sub_category_code=sub_cat).all())
    assert get_data['required_documents'][0]['req_document_category'] == cat
    assert get_data['required_documents'][0]['req_document_sub_category_code'] == sub_cat
