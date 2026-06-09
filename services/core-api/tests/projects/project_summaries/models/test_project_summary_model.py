import uuid
from unittest.mock import patch, MagicMock, ANY

from tests.factories import MineFactory, ProjectSummaryFactory, ProjectFactory

from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.ministry_contacts.models.distribution_list import DistributionListNames


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


@patch('app.api.projects.project.models.project.Project.has_mines_act_auths', return_value=True)
@patch('app.api.projects.project.models.project.Project.has_ema_auths', return_value=False)
@patch('app.api.services.email_service.EmailService.send_template_email_async')
def test_send_project_summary_email_sub_status(mock_send_async, mock_ema, mock_mines_act, db_session):
    project_summary = ProjectSummaryFactory(set_status_code='SUB')
    mine = MineFactory()
    project_summary.send_project_summary_email(mine, 'Test message')

    assert mock_send_async.call_count >= 1
    first_call = mock_send_async.call_args_list[0]
    assert first_call.kwargs['reference_table'] == 'project_summary'
    assert first_call.kwargs['distribution_list'] == DistributionListNames.MAJOR_PROJECTS


