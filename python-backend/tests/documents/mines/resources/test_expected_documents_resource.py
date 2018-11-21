import json
from tests.constants import


# GET
def test_get_all_expected_documents_by_mine_guid(test_client, auth_headers):
    get_resp = test_client.get('/documents/mines/expected/' + TEST_MINE_GUID , headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_expected_documents']) == 1

def test_get_all_expected_documents_by_mine_guid_after_insert(test_client, auth_headers):
    new_expected_document = [{
        'mine_guid' : TEST_MINE_GUID,
        'req_document_guid':TEST_REQUIRED_REPORT_GUID1,
        'document_name':TEST_REQUIRED_REPORT_NAME1
    }]

    post_resp = test_client.post('/documents/mines/expected/' + TEST_MINE_GUID , headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200
    assert len(get_data['mine_expected_documents']) == 1


def post(self, mine_guid):
        data = self.parser.parse_args()
        doc_list =  data['documents']
        mine_new_docs = []
        for new_doc in doc_list:
            mine_exp_doc = MineExpectedDocument(
                req_document_guid=new_doc['req_document_guid'],
                exp_document_name=new_doc['document_name'],
                exp_document_description=new_doc['document_description'],
                mine_guid = mine_guid,
                **self.get_create_update_dict()
            )
            mine_exp_doc.save()
            mine_new_docs.append(mine_exp_doc)
        return {
            'mine_expected_documents' : list(map(lambda x: x.json(), mine_new_docs))
        }