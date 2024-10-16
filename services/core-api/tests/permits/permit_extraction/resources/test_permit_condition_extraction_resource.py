import json
import uuid
from unittest import mock

import pytest
import responses
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.config import Config
from app.extensions import db
from app.tasks.celery import celery
from tests.factories import PermitAmendmentDocumentFactory, create_mine_and_permit


@pytest.fixture(scope='function')
def pc_test_data(test_client, db_session):
    mine, permit = create_mine_and_permit()

    amendment = permit.permit_amendments[0]
    amendment_document = PermitAmendmentDocumentFactory(permit_amendment=amendment)

    yield (amendment, amendment_document)


def test_post_permit_condition_fails_with_existing_conditions(pc_test_data, auth_headers, test_client, db_session):
    amendment, amendment_document = pc_test_data

    data = {
        'permit_amendment_id': str(amendment.permit_amendment_id),
        'permit_amendment_document_guid': str(amendment_document.permit_amendment_document_guid)
    }

    response = test_client.post('/mines/permits/condition-extraction', json=data, headers=auth_headers['full_auth_header'])
    assert response.status_code == 400
    data = response.json

    assert data['message'] == '400 Bad Request: Permit conditions already exist for this permit amendment'
    assert data['status'] == 400


def test_post_permit_condition_fails_with_invalid_document(test_client, auth_headers, pc_test_data, db_session):
    amendment, amendment_document = pc_test_data

    data = {
        'permit_amendment_id': uuid.uuid4(),
        'permit_amendment_document_guid': str(amendment_document.permit_amendment_document_guid)
    }

    response = test_client.post('/mines/permits/condition-extraction', json=data, headers=auth_headers['full_auth_header'])
    assert response.status_code == 400
    data = response.json

    assert data['message'] == '400 Bad Request: Permit document must be associated with the permit amendment'
    assert data['status'] == 400  

def test_post_permit_condition_fails_with_invalid_permit_amendment(test_client, auth_headers, db_session):
    # Prepare the request data
    mine, permit = create_mine_and_permit()

    amendment = permit.permit_amendments[0]

    data = {
        'permit_amendment_id': str(amendment.permit_amendment_id),
        'permit_amendment_document_guid': uuid.uuid4()
    }

    response = test_client.post('/mines/permits/condition-extraction', json=data, headers=auth_headers['full_auth_header'])
    assert response.status_code == 400
    data = response.json

    assert data['message'] == '400 Bad Request: Permit document not found'
    assert data['status'] == 400  

@responses.activate
@mock.patch('app.api.mines.permits.permit_extraction.resources.permit_condition_extraction_resource.poll_update_permit_extraction_status.delay')
def test_post_permit_condition_extraction(delay, test_client, auth_headers, pc_test_data, db_session):
    delay.return_value = mock.Mock(id='123')

    amendment, amendment_document = pc_test_data
    PermitConditions.query.filter_by(permit_amendment_id=amendment.permit_amendment_id).delete()
    responses.add(responses.POST, f'https://test.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/token', json={'access_token':'123'})
    responses.add(responses.GET, f'{Config.DOCUMENT_MANAGER_URL}/documents', body="abc", headers={'Content-Type': 'application/octet-stream', 'Content-Disposition': 'filename=test.pdf'}, status=200)
    responses.add(responses.POST, f'{Config.PERMITS_ENDPOINT}/permit_conditions', json={'id': '123', 'status': 'PENDING', 'meta': {}}, status=200)

    data = {
        'permit_amendment_id': str(amendment.permit_amendment_id),
        'permit_amendment_document_guid': str(amendment_document.permit_amendment_document_guid)
    }
    # Send the POST request
    response = test_client.post('/mines/permits/condition-extraction', json=data, headers=auth_headers['full_auth_header'])
    # Check the response status code
    assert response.status_code == 200
    
    # Check the response data
    response_data = json.loads(response.data)
    assert 'permit_extraction_task_id' in response_data
    assert 'core_status_task_id' in response_data
    assert 'task_status' in response_data
    assert response_data['task_status'] == 'PENDING'
    
    delay.assert_called_once_with(uuid.UUID(response_data['permit_extraction_task_id']))



def test_get_permit_extraction_tasks(test_client, auth_headers, pc_test_data, db_session):
    # Create test data
    permit_amendment, permit_amendment_document = pc_test_data
    task1 = PermitExtractionTask(
        permit_extraction_task_id=uuid.uuid4(),
        permit_amendment_guid=permit_amendment.permit_amendment_guid,
        task_id='123',
        task_status='PENDING',
        task_result=None,
        core_status_task_id='456',
        permit_amendment_document_guid=permit_amendment_document.permit_amendment_document_guid
    )

    task2 = PermitExtractionTask(
        permit_extraction_task_id=uuid.uuid4(),
        permit_amendment_guid=permit_amendment.permit_amendment_guid,
        task_id='123',
        task_status='PENDING',
        task_result=None,
        core_status_task_id='456',
        permit_amendment_document_guid=permit_amendment_document.permit_amendment_document_guid
    )

    task1.save()
    task2.save()

    # Send GET request
    response = test_client.get(f'/mines/permits/condition-extraction?permit_amendment_id={permit_amendment.permit_amendment_id}', headers=auth_headers['full_auth_header'])
    assert response.status_code == 200

    # Check the response data
    response_data = json.loads(response.data)
    assert 'tasks' in response_data
    assert len(response_data['tasks']) == 2
    assert response_data['tasks'][1]['permit_extraction_task_id'] == str(task1.permit_extraction_task_id)
    assert response_data['tasks'][0]['permit_extraction_task_id'] == str(task2.permit_extraction_task_id)

def test_get_permit_extraction_tasks_fails_with_unknown_permit_amendment(test_client, auth_headers, db_session):
    response = test_client.get('/mines/permits/condition-extraction?permit_amendment_id=123123', headers=auth_headers['full_auth_header'])
    assert response.status_code == 400
    assert response.json['message'] == '400 Bad Request: Permit amendment not found'


def test_delete_permit_conditions(test_client, auth_headers, pc_test_data, db_session):
    # Create test data
    amendment, amendment_document = pc_test_data

    assert PermitConditions.query.filter_by(permit_amendment_id=amendment.permit_amendment_id, deleted_ind=False).count() > 0

    # Send DELETE request
    response = test_client.delete(f'/mines/permits/condition-extraction?permit_amendment_id={amendment.permit_amendment_id}', headers=auth_headers['full_auth_header'])
    assert response.status_code == 200

    assert PermitConditions.query.filter_by(permit_amendment_id=amendment.permit_amendment_id, deleted_ind=False).count() == 0


def test_get_permit_extraction_tasks(test_client, auth_headers, pc_test_data, db_session):
    permit_amendment, permit_amendment_document = pc_test_data
    task1 = PermitExtractionTask(
        permit_extraction_task_id=uuid.uuid4(),
        permit_amendment_guid=permit_amendment.permit_amendment_guid,
        task_id=uuid.uuid4(),
        task_status='PENDING',
        task_result=None,
        core_status_task_id='456',
        permit_amendment_document_guid=permit_amendment_document.permit_amendment_document_guid
    )

    task2 = PermitExtractionTask(
        permit_extraction_task_id=uuid.uuid4(),
        permit_amendment_guid=permit_amendment.permit_amendment_guid,
        task_id=uuid.uuid4(),
        task_status='PENDING',
        task_result=None,
        core_status_task_id='456',
        permit_amendment_document_guid=permit_amendment_document.permit_amendment_document_guid
    )

    db.session.add(task1)
    db.session.add(task2)
    db.session.commit()

    response = test_client.get(f'/mines/permits/condition-extraction/{task1.task_id}', headers=auth_headers['full_auth_header'])
    assert response.status_code == 200

    # Check the response data
    response_data = json.loads(response.data)
    assert response_data['permit_extraction_task_id'] == str(task1.permit_extraction_task_id)

    response = test_client.get(f'/mines/permits/condition-extraction/{task2.task_id}', headers=auth_headers['full_auth_header'])
    assert response.status_code == 200

    # Check the response data
    response_data = json.loads(response.data)
    assert response_data['permit_extraction_task_id'] == str(task2.permit_extraction_task_id)


def test_get_permit_extraction_tasks_fails_with_unknown_permit_amendment(test_client, auth_headers, db_session):
    response = test_client.get(f'/mines/permits/condition-extraction/{str(uuid.uuid4())}', headers=auth_headers['full_auth_header'])
    assert response.status_code == 400
    assert response.json['message'] == '400 Bad Request: Task not found'