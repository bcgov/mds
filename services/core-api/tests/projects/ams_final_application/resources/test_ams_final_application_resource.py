import json
import uuid
from tests.factories import AmsFinalApplicationFactory, ProjectSummaryAmsAuthorizationFactory, ProjectSummaryFactory, ProjectFactory, MineFactory
from tests.status_code_gen import RandomAmsFinalApplicationDocumentTypeCode

# test get by project summary guid
def test_get_all_ams_final_apps_by_project_summary_guid(test_client, db_session, auth_headers):
    
    project_summary = ProjectSummaryFactory()

    auth_1 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_2 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_3 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    auth_4 = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)

    final_app_1 = AmsFinalApplicationFactory(project_summary_authorization=auth_1)
    final_app_2 = AmsFinalApplicationFactory(project_summary_authorization=auth_2)
    final_app_3 = AmsFinalApplicationFactory(project_summary_authorization=auth_3)

    get_resp = test_client.get(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == 3
    assert get_data['records'][0]['ams_final_application_guid'] == str(final_app_1.ams_final_application_guid)
    assert get_data['records'][1]['ams_final_application_guid'] == str(final_app_2.ams_final_application_guid)
    assert get_data['records'][2]['ams_final_application_guid'] == str(final_app_3.ams_final_application_guid)

# test get list (single record) by project summary authorization guid
def test_get_ams_final_apps_by_project_summary_auth_guid(test_client, db_session, auth_headers):
    
    project_summary = ProjectSummaryFactory()

    auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)
    other_auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)

    final_app = AmsFinalApplicationFactory(project_summary_authorization=auth)
    # should not be returned in get request
    other_app = AmsFinalApplicationFactory(project_summary_authorization=other_auth)

    get_resp = test_client.get(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application?project_summary_authorization_guid={auth.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header']
    )
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) == 1
    assert get_data['records'][0]['ams_final_application_guid'] == str(final_app.ams_final_application_guid)

# test create
def test_post_ams_final_application(test_client, db_session, auth_headers):
    project_summary = ProjectSummaryFactory()
    auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=True)

    post_data = {
        'project_summary_authorization_guid': auth.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }

    post_resp = test_client.post(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application/{auth.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=post_data
    )
    post_resp_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 201
    assert post_resp_data['project_summary_authorization_guid'] == str(auth.project_summary_authorization_guid)
    assert post_resp_data['submitter_name'] == 'Submitter Name'
    assert post_resp_data['is_agent'] == False
    assert post_resp_data['is_draft'] == True
    assert post_resp_data['ams_final_application_guid'] is not None    

    

# test add documents
def test_put_ams_final_application_documents(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    project = ProjectFactory(mine=mine)
    project_summary = ProjectSummaryFactory(project=project)
    auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=True)

    post_data = {
        'project_summary_authorization_guid': auth.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }

    post_resp = test_client.post(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application/{auth.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=post_data
    )
    post_resp_data = json.loads(post_resp.data.decode())
    final_app_guid = post_resp_data['ams_final_application_guid']

    doc_data = [
        {
            'document_manager_guid': uuid.uuid4(),
            'document_name': "First Document.pdf",
            'ams_final_application_document_type_code': RandomAmsFinalApplicationDocumentTypeCode()
        },
        {
            'document_manager_guid': uuid.uuid4(),
            'document_name': "Second Document.pdf",
            'ams_final_application_document_type_code': RandomAmsFinalApplicationDocumentTypeCode()
        },
        {
            'document_manager_guid': uuid.uuid4(),
            'document_name': "Third Document.pdf",
            'ams_final_application_document_type_code': RandomAmsFinalApplicationDocumentTypeCode()
        }
    ]
    # test add documents
    put_docs_data = {
        **post_data,  # include all post_data fields
        'documents': doc_data,
        'pre_submitted_files': ['LOC', 'DFF', 'SIT'],
        'ams_final_application_guid': final_app_guid,
    }

    put_docs_resp = test_client.put(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application/{auth.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=put_docs_data
    )
    put_docs_resp_data = json.loads(put_docs_resp.data.decode())

    assert put_docs_resp.status_code == 200
    assert put_docs_resp_data['is_draft'] == True
    assert put_docs_resp_data['submitted_timestamp'] is None
    assert put_docs_resp_data['pre_submitted_files'] == put_docs_data['pre_submitted_files']
    assert len(put_docs_resp_data['documents']) == len(doc_data)
    # loop through documents and compare to doc_data:
    for i, doc in enumerate(put_docs_resp_data['documents']):
        expected = doc_data[i]
        assert doc['document_name'] == expected['document_name']
        assert doc['ams_final_application_document_type_code'] == expected['ams_final_application_document_type_code']
        assert doc['mine_document_guid'] is not None
        assert doc['ams_final_application_guid'] == final_app_guid

def test_put_ams_final_application_submit(test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False)

    documents = [
        {
            'document_manager_guid': d.document_manager_guid,
            'document_name': d.document_name,
            'mine_document_guid': d.mine_document_guid,
            'ams_final_application_document_type_code': d.ams_final_application_document_type_code
        }
        for d in list(final_app.documents)
    ]

    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'project_summary_authorization_guid': final_app.project_summary_authorization_guid,
        'submitter_name': final_app.submitter_name,
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': documents,
        'is_submitting': True
    }

    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=put_data
    )

    put_resp_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_resp_data['is_draft'] == False
    assert put_resp_data['submitted_timestamp'] is not None

def test_ams_final_app_unsubmitted_raises_error(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    project = ProjectFactory(mine=mine)
    project_summary = ProjectSummaryFactory(project=project)
    auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=False)

    post_data = {
        'project_summary_authorization_guid': auth.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }

    post_resp = test_client.post(
        f'/projects/{project_summary.project_summary_guid}/ams-final-application/{auth.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=post_data
    )
    post_resp_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 400
    assert "Authorization must be successfully submitted before creating the final application" in post_resp_data['message']
    
def test_put_ams_final_remove_documents(test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False, documents=2)

    # update to not include any of the documents- delete
    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'project_summary_authorization_guid': final_app.project_summary_authorization_guid,
        'submitter_name': final_app.submitter_name,
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': [
            {
                'ams_final_application_document_guid': str(final_app.documents[0].ams_final_application_document_xref_guid),
                'document_manager_guid': str(final_app.documents[0].document_manager_guid),
                'document_name': final_app.documents[0].document_name,
                'mine_document_guid': str(final_app.documents[0].mine_document_guid),
                'ams_final_application_document_type_code': final_app.documents[0].ams_final_application_document_type_code
        }
        ],
    }
    
    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=put_data
    )

    put_resp_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_resp_data['is_draft'] == True
    assert len(put_resp_data['documents']) == 1
    assert put_resp_data['documents'][0]['document_manager_guid'] == str(final_app.documents[0].document_manager_guid)

def test_put_ams_final_app_minespace_edit_toggle(test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False)

    documents = [
        {
            'document_manager_guid': d.document_manager_guid,
            'document_name': d.document_name,
            'mine_document_guid': d.mine_document_guid,
            'ams_final_application_document_type_code': d.ams_final_application_document_type_code
        }
        for d in list(final_app.documents)
    ]

    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'project_summary_authorization_guid': final_app.project_summary_authorization_guid,
        'submitter_name': final_app.submitter_name,
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': documents,
        'is_submitting': True,
        'editable': False,
    }

    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data
    )

    put_resp_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_resp_data['editable'] == False
