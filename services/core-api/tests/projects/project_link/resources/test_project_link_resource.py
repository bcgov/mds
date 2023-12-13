from tests.factories import ProjectLinkFactory, ProjectFactory, MineFactory


def test_post_project_link(test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True, project=0)
    project_link = ProjectLinkFactory()
    data = {
        "mine_guid": mine.mine_guid,
        "related_project_guids": [project_link.related_project_guid]
    }

    post_resp = test_client.post(
        f'/projects/{project_link.project_guid}/project-link',
        data=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201

def test_delete_project_link(test_client, db_session, auth_headers):
    batch_size = 1

    project_links = ProjectLinkFactory.create_batch(size=batch_size)
    project_link_to_delete = project_links[0]

    delete_resp = test_client.delete(
        f'/projects/{project_link_to_delete.project_guid}/project-link/{project_link_to_delete.project_link_guid}',
        headers=auth_headers['full_auth_header'])
    assert delete_resp.status_code == 204