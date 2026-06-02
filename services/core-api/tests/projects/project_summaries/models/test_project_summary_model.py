import uuid
from unittest.mock import patch, MagicMock, ANY

from tests.factories import MineFactory, ProjectSummaryFactory, ProjectFactory

from app.api.projects.project_summary.models.project_summary import ProjectSummary


def test_project_summary_find_by_project_summary_guid(db_session):
    project_summary = ProjectSummaryFactory()
    project_summary_guid = project_summary.project_summary_guid
    project_summary = ProjectSummary.find_by_project_summary_guid(str(project_summary_guid))
    assert project_summary.project_summary_guid == project_summary_guid


def test_project_summary_find_by_project_guid(db_session):
    batch_size = 1
    project = ProjectFactory.create_batch(size=batch_size)
    project_summaries = ProjectSummary.find_by_project_guid(str(project[0].project_guid))

    assert len(project_summaries) == batch_size
    assert all(project_summary.project_guid == project[0].project_guid
               for project_summary in project_summaries)


@patch('app.api.email_tracking.email_status_tasks.send_template_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name')
def test_send_project_summary_email_with_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    dl_mock = MagicMock()
    dl_mock.get_emails.return_value = ['projects@example.com']
    dl_mock.distribution_list_guid = uuid.uuid4()
    mock_find_by_name.return_value = dl_mock

    project_summary = ProjectSummaryFactory(set_status_code='SUB')
    mine = MineFactory()
    project_summary.send_project_summary_email(mine, 'Test message')

    assert mock_apply_async.call_count >= 1
    first_kwargs = mock_apply_async.call_args_list[0][1]['kwargs']
    assert first_kwargs['reference_table'] == 'project_summary'
    assert first_kwargs['distribution_list_guid'] == str(dl_mock.distribution_list_guid)


@patch('app.api.email_tracking.email_status_tasks.send_template_email_task.apply_async')
@patch('app.api.ministry_contacts.models.distribution_list.DistributionList.find_by_name', return_value=None)
def test_send_project_summary_email_no_distribution_list(mock_find_by_name, mock_apply_async, db_session):
    project_summary = ProjectSummaryFactory(set_status_code='SUB')
    mine = MineFactory()
    project_summary.send_project_summary_email(mine, 'Test message')

    assert mock_apply_async.call_count >= 1
