from tests.factories import ProjectLinkFactory, ProjectFactory, MineFactory


def test_post_project_link(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True, project=0)
    project_link = ProjectLinkFactory()
    data = {
        "project_guid": project_link.project_guid,
        "related_project_guid": project_link.related_project_guid
    }

    post_resp = test_client.post(
        f'/projects/{mine.mine_guid}/project-link',
        data=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201