import json

from tests.factories import ProjectFactory, MajorMineApplicationFactory


def test_get_major_mine_application_by_major_mine_application_guid(test_client, db_session,
                                                                   auth_headers):
    project = ProjectFactory()
    major_mine_application = MajorMineApplicationFactory(project=project)

    get_resp = test_client.get(
        f'/projects/{major_mine_application.project.project_guid}/major-mine-application/{major_mine_application.major_mine_application_guid}',
        headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())

    assert get_resp.status_code == 200
    assert get_data['project_guid'] == str(major_mine_application.project.project_guid)
    assert get_data['major_mine_application_guid'] == str(
        major_mine_application.major_mine_application_guid)
    assert get_data['status_code'] == str(major_mine_application.status_code)
