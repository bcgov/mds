import json

from tests.factories import ProjectFactory, ProjectSummaryFactory, ProjectSummaryMinistryCommentFactory

def test_create_project_summary_ministry_comment(test_client, db_session, auth_headers):
    project = ProjectFactory()
    project_summary = ProjectSummaryFactory(project=project)

    data = {
        'content': 'This is a test ministry comment.'
    }

    post_resp = test_client.post(
        f'/projects/{project_summary.project_summary_guid}/ministry-comments',
        headers=auth_headers['full_auth_header'],
        json=data)

    post_data = json.loads(post_resp.data.decode())

    assert post_resp.status_code == 200
    assert post_data['content'] == data['content']
    assert post_data['project_summary_guid'] == str(project_summary.project_summary_guid)

def test_get_project_summary_ministry_comments(test_client, db_session, auth_headers):
    project = ProjectFactory()
    project_summary = ProjectSummaryFactory(project=project)
    ministry_comment = ProjectSummaryMinistryCommentFactory(project_summary=project_summary)

    get_resp = test_client.get(
        f'/projects/{project_summary.project_summary_guid}/ministry-comments',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert len(get_data['records']) > 0
    assert get_data['records'][len(get_data['records']) - 1]['content'] == ministry_comment.content
    assert get_data['records'][len(get_data['records']) - 1]['project_summary_guid'] == str(project_summary.project_summary_guid)