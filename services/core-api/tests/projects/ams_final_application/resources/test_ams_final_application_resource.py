import json
import uuid

import pytest
from unittest.mock import patch
from app import auth
from app.api.utils.include.user_info import User
from app.api.projects.ams_final_application.models.ams_final_application import AmsAppNotificationEvent
from tests.factories import (
    AmsFinalApplicationFactory,
    MineFactory,
    MinespaceSubscriptionFactory,
    MinespaceUserFactory,
    ProjectFactory,
    ProjectSummaryAmsAuthorizationFactory,
    ProjectSummaryFactory,
)
from tests.status_code_gen import RandomAmsFinalApplicationDocumentTypeCode

# -----------------------------------------------------------------------------
# Test utilities / helpers
# -----------------------------------------------------------------------------

def _staff_header(auth_headers):
    return auth_headers['full_auth_header']


def _proponent_header(auth_headers):
    return auth_headers['proponent_only_auth_header']


def subscribe_minespace_user(db_session, project_summary, email='test-proponent@bceid'):
    """Create a MineSpace user and subscribe them to the mine of the given project summary."""
    ms_user = MinespaceUserFactory(bceid_username=email)  # type: ignore[arg-type]
    MinespaceSubscriptionFactory(mine=project_summary.project.mine, minespace_user=ms_user)  # type: ignore[arg-type]
    db_session.commit()
    auth.clear_cache()
    return ms_user


def _enable_real_user_mode():
    # Disable any test-mode short–circuiting so access decorators execute real logic
    User._test_mode = False
    auth.apply_security = True
    auth.clear_cache()


# -----------------------------------------------------------------------------
# Parameterized access control + functionality tests (staff vs proponent)
# -----------------------------------------------------------------------------


@pytest.mark.parametrize("as_proponent", [False, True])
def test_list_ams_final_apps_by_project_summary_guid(test_client, db_session, auth_headers, as_proponent):
    project_summary = ProjectSummaryFactory()
    # Create 3 authorizations + final apps
    auths = [ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary) for _ in range(3)]  # type: ignore[arg-type]
    for a in auths:
        AmsFinalApplicationFactory(project_summary_authorization=a)  # type: ignore[arg-type]

    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        # Pre-subscription should hide existence => 404
        pre_resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application",
            headers=header,
        )
        assert pre_resp.status_code == 404
        # Subscribe then succeed
        subscribe_minespace_user(db_session, project_summary)
        resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application",
            headers=header,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 200
        assert len(data['records']) == 3
    else:
        header = _staff_header(auth_headers)
        resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application",
            headers=header,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 200
        assert len(data['records']) == 3


@pytest.mark.parametrize("as_proponent", [False, True])
def test_get_ams_final_apps_by_authorization_guid_filter(test_client, db_session, auth_headers, as_proponent):
    project_summary = ProjectSummaryFactory()
    target_auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)  # type: ignore[arg-type]
    other_auth = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary)  # type: ignore[arg-type]
    final_app = AmsFinalApplicationFactory(project_summary_authorization=target_auth)  # type: ignore[arg-type]
    AmsFinalApplicationFactory(project_summary_authorization=other_auth)  # type: ignore[arg-type]

    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        pre_resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application?project_summary_authorization_guid={target_auth.project_summary_authorization_guid}",
            headers=header,
        )
        assert pre_resp.status_code == 404
        subscribe_minespace_user(db_session, project_summary)
        resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application?project_summary_authorization_guid={target_auth.project_summary_authorization_guid}",
            headers=header,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 200
        assert len(data['records']) == 1
        assert data['records'][0]['ams_final_application_guid'] == str(final_app.ams_final_application_guid)
    else:
        header = _staff_header(auth_headers)
        resp = test_client.get(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application?project_summary_authorization_guid={target_auth.project_summary_authorization_guid}",
            headers=header,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 200
        assert len(data['records']) == 1
        assert data['records'][0]['ams_final_application_guid'] == str(final_app.ams_final_application_guid)


@pytest.mark.parametrize("as_proponent", [False, True])
def test_create_ams_final_application(test_client, db_session, auth_headers, as_proponent):
    project_summary = ProjectSummaryFactory()
    authorization = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=True)  # type: ignore[arg-type]
    post_data = {
        'project_summary_authorization_guid': authorization.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }

    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        pre_resp = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=post_data,
        )
        # Hidden before subscription
        assert pre_resp.status_code == 404
        subscribe_minespace_user(db_session, project_summary)
        resp = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=post_data,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 201
        assert data['project_summary_authorization_guid'] == str(authorization.project_summary_authorization_guid)
    else:
        header = _staff_header(auth_headers)
        resp = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=post_data,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 201
        assert data['project_summary_authorization_guid'] == str(authorization.project_summary_authorization_guid)


@pytest.mark.parametrize("as_proponent", [False, True])
def test_create_ams_final_application_unsubmitted_auth(test_client, db_session, auth_headers, as_proponent):
    project_summary = ProjectSummaryFactory()
    authorization = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=False)  # type: ignore[arg-type]
    post_data = {
        'project_summary_authorization_guid': authorization.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }
    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        # Business rule triggers before need for subscription: expect 400
        resp = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=post_data,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 400
        assert 'Authorization must be successfully submitted' in data['message']
    else:
        header = _staff_header(auth_headers)
        resp = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=post_data,
        )
        data = json.loads(resp.data.decode())
        assert resp.status_code == 400
        assert 'Authorization must be successfully submitted' in data['message']


@pytest.mark.parametrize("as_proponent", [False, True])
def test_update_ams_final_application_add_documents(test_client, db_session, auth_headers, as_proponent):
    # Need explicit mine/project to ensure subscription attaches correctly
    mine = MineFactory(minimal=True)
    project = ProjectFactory(mine=mine)
    project_summary = ProjectSummaryFactory(project=project)
    authorization = ProjectSummaryAmsAuthorizationFactory(project_summary=project_summary, submit_success=True)  # type: ignore[arg-type]

    create_payload = {
        'project_summary_authorization_guid': authorization.project_summary_authorization_guid,
        'submitter_name': 'Submitter Name',
        'is_agent': False,
    }

    header = _proponent_header(auth_headers) if as_proponent else _staff_header(auth_headers)
    if as_proponent:
        _enable_real_user_mode()
        pre_create = test_client.post(
            f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
            headers=header,
            json=create_payload,
        )
        assert pre_create.status_code == 404
        subscribe_minespace_user(db_session, project_summary)

    create_resp = test_client.post(
        f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
        headers=header,
        json=create_payload,
    )
    assert create_resp.status_code == 201
    final_app_guid = json.loads(create_resp.data.decode())['ams_final_application_guid']

    doc_payload = [
        {
            'document_manager_guid': uuid.uuid4(),
            'document_name': 'One.pdf',
            'ams_final_application_document_type_code': RandomAmsFinalApplicationDocumentTypeCode(),
        },
        {
            'document_manager_guid': uuid.uuid4(),
            'document_name': 'Two.pdf',
            'ams_final_application_document_type_code': RandomAmsFinalApplicationDocumentTypeCode(),
        },
    ]
    put_payload = {
        **create_payload,
        'ams_final_application_guid': final_app_guid,
        'documents': doc_payload,
        'pre_submitted_files': ['LOC'],
    }
    put_resp = test_client.put(
        f"/projects/{project_summary.project_summary_guid}/ams-final-application/{authorization.project_summary_authorization_guid}",
        headers=header,
        json=put_payload,
    )
    data = json.loads(put_resp.data.decode())
    assert put_resp.status_code == 200
    assert len(data['documents']) == 2


@pytest.mark.parametrize("as_proponent", [False, True])
def test_submit_ams_final_application(test_client, db_session, auth_headers, as_proponent):
    final_app = AmsFinalApplicationFactory(is_submitted=False)
    documents = [
        {
            'document_manager_guid': d.document_manager_guid,
            'document_name': d.document_name,
            'mine_document_guid': d.mine_document_guid,
            'ams_final_application_document_type_code': d.ams_final_application_document_type_code,
        }
        for d in list(final_app.documents)
    ]
    put_payload = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'project_summary_authorization_guid': final_app.project_summary_authorization_guid,
        'submitter_name': final_app.submitter_name,
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': documents,
        'is_submitting': True,
    }

    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        pre_resp = test_client.put(
            f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}",
            headers=header,
            json=put_payload,
        )
        assert pre_resp.status_code == 404
        subscribe_minespace_user(db_session, final_app.project_summary_authorization.project_summary)
    else:
        header = _staff_header(auth_headers)

    resp = test_client.put(
        f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}",
        headers=header,
        json=put_payload,
    )
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200
    assert data['is_draft'] is False
    assert data['submitted_timestamp'] is not None


@pytest.mark.parametrize("as_proponent", [False, True])
def test_update_ams_final_application_remove_documents(test_client, db_session, auth_headers, as_proponent):
    final_app = AmsFinalApplicationFactory(is_submitted=False, documents=2)
    put_payload = {
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
                'ams_final_application_document_type_code': final_app.documents[0].ams_final_application_document_type_code,
            }
        ],
    }

    if as_proponent:
        _enable_real_user_mode()
        header = _proponent_header(auth_headers)
        pre_resp = test_client.put(
            f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}",
            headers=header,
            json=put_payload,
        )
        assert pre_resp.status_code == 404
        subscribe_minespace_user(db_session, final_app.project_summary_authorization.project_summary)
    else:
        header = _staff_header(auth_headers)

    resp = test_client.put(
        f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}",
        headers=header,
        json=put_payload,
    )
    data = json.loads(resp.data.decode())
    assert resp.status_code == 200
    assert len(data['documents']) == 1
    assert data['documents'][0]['document_manager_guid'] == str(final_app.documents[0].document_manager_guid)

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
        'editable': False,
    }

    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data
    )

    put_resp_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_resp_data['editable'] == False

    put_data2 = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': True,
    }

    put_resp2 = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data2
    )

    put_resp_data2 = json.loads(put_resp2.data.decode())
    assert put_resp_data2['editable'] == True


def test_minespace_edit_toggle_proponent_forbidden(test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False)
    _enable_real_user_mode()
    header = _proponent_header(auth_headers)
    # Subscribe so project/mine access passes before role check
    subscribe_minespace_user(db_session, final_app.project_summary_authorization.project_summary)
    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': False,
    }
    resp = test_client.put(
        f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit",
        headers=header,
        json=put_data,
    )
    assert resp.status_code == 403


def test_proponent_cannot_update_when_editing_disabled(test_client, db_session, auth_headers):
    # Create draft final application
    final_app = AmsFinalApplicationFactory(is_submitted=False)

    # Staff toggles editable to False
    staff_header = _staff_header(auth_headers)
    toggle_payload = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': False,
    }
    toggle_resp = test_client.put(
        f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit",
        headers=staff_header,
        json=toggle_payload,
    )
    assert toggle_resp.status_code == 200
    toggle_data = json.loads(toggle_resp.data.decode())
    assert toggle_data['editable'] is False

    # Prepare proponent context
    _enable_real_user_mode()
    subscribe_minespace_user(db_session, final_app.project_summary_authorization.project_summary)
    proponent_header = _proponent_header(auth_headers)

    # Build an update payload (attempting normal PUT)
    documents = [
        {
            'document_manager_guid': d.document_manager_guid,
            'document_name': d.document_name,
            'mine_document_guid': d.mine_document_guid,
            'ams_final_application_document_type_code': d.ams_final_application_document_type_code,
        }
        for d in list(final_app.documents)
    ]
    update_payload = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'project_summary_authorization_guid': final_app.project_summary_authorization_guid,
        'submitter_name': final_app.submitter_name,
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': documents,
        'is_submitting': False,
    }

    blocked_resp = test_client.put(
        f"/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}",
        headers=proponent_header,
        json=update_payload,
    )
    blocked_data = json.loads(blocked_resp.data.decode())
    assert blocked_resp.status_code == 400
    assert 'cannot currently be editted' in blocked_data['message']


@patch("app.api.projects.ams_final_application.models.ams_final_application.AmsFinalApplication.send_notifications")
def test_submit_triggers_submit_notification(mock_send_notifications, test_client, db_session, auth_headers):
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
    
    assert put_resp.status_code == 200
    mock_send_notifications.assert_called_once_with(AmsAppNotificationEvent.SUBMIT)


@patch("app.api.projects.ams_final_application.models.ams_final_application.AmsFinalApplication.send_notifications")
def test_resubmit_triggers_resubmit_notification(mock_send_notifications, test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=True)
    
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
        'submitter_name': 'Updated Submitter',
        'is_agent': final_app.is_agent,
        'pre_submitted_files': final_app.pre_submitted_files,
        'documents': documents,
        'is_submitting': True
    }
    
    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}',
        headers=auth_headers['full_auth_header'], json=put_data
    )
    
    assert put_resp.status_code == 200
    mock_send_notifications.assert_called_once_with(AmsAppNotificationEvent.RESUBMIT)


@patch("app.api.projects.ams_final_application.models.ams_final_application.AmsFinalApplication.send_notifications")
def test_edit_toggle_off_triggers_edit_off_notification(mock_send_notifications, test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False, editable=True)
    
    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': False,
    }
    
    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data
    )
    
    assert put_resp.status_code == 200
    mock_send_notifications.assert_called_once_with(AmsAppNotificationEvent.EDIT_OFF)


@patch("app.api.projects.ams_final_application.models.ams_final_application.AmsFinalApplication.send_notifications")
def test_edit_toggle_on_triggers_edit_on_notification(mock_send_notifications, test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False, editable=False)
    
    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': True,
    }
    
    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data
    )
    
    assert put_resp.status_code == 200
    mock_send_notifications.assert_called_once_with(AmsAppNotificationEvent.EDIT_ON)


@patch("app.api.projects.ams_final_application.models.ams_final_application.AmsFinalApplication.send_notifications")
def test_edit_toggle_no_change_no_notification(mock_send_notifications, test_client, db_session, auth_headers):
    final_app = AmsFinalApplicationFactory(is_submitted=False, editable=True)
    
    put_data = {
        'ams_final_application_guid': final_app.ams_final_application_guid,
        'editable': True,
    }
    
    put_resp = test_client.put(
        f'/projects/{final_app.project_summary_authorization.project_summary_guid}/ams-final-application/{final_app.project_summary_authorization_guid}/minespace-edit',
        headers=auth_headers['full_auth_header'], json=put_data
    )
    
    assert put_resp.status_code == 200
    mock_send_notifications.assert_not_called()
