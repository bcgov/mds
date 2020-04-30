import json
import uuid
import pytest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition

from tests.factories import MineFactory


def test_post_mine_report_comment(test_client, db_session, auth_headers):
    mine = MineFactory()
    num_comments = len(mine.comments)

    data = {'mine_comment': 'Test comment'}

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/comments', headers=auth_headers['full_auth_header'], json=data)

    updated_mine = Mine.find_by_mine_guid(str(mine.mine_guid))
    comments = updated_mine.comments

    assert post_resp.status_code == 201
    assert len(comments) == num_comments + 1
    assert comments[-1].mine_comment == 'Test comment'


def test_post_mine_report_comment_no_body(test_client, db_session, auth_headers):
    mine = MineFactory()
    data = {}
    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/comments', headers=auth_headers['full_auth_header'], json=data)

    assert post_resp.status_code == 400


def test_delete_mine_comment(test_client, db_session, auth_headers):
    mine = MineFactory()
    num_comments = len(mine.comments)
    comment_to_delete = mine.comments[0]

    del_resp = test_client.delete(
        f'/mines/{mine.mine_guid}/comments/{comment_to_delete.mine_comment_guid}',
        headers=auth_headers['full_auth_header'])

    updated_mine = Mine.find_by_mine_guid(str(mine.mine_guid))

    assert del_resp.status_code == 204
    assert len(updated_mine.comments) == num_comments - 1
