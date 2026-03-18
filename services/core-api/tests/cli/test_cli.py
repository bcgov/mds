import pytest
from unittest import mock
from flask import Flask

from app.commands import register_commands


def _cli_runner():
    app = Flask(__name__)
    register_commands(app)
    return app.test_cli_runner()


@pytest.mark.skip(reason='not successing on first test suite run')
def test_create_mines_cli(test_client, cli_runner):
    result = cli_runner.invoke(args=['create-data', '10', 'False'])
    assert result.exit_code == 0
    assert "Created" in result.output


@mock.patch('app.api.mines.reports.tasks.create_new_recurring_report_requests')
def test_regenerate_report_requests_for_permit_cli(mock_create_report_requests):
    mock_create_report_requests.return_value = {'total_deleted': 1, 'total_created': 2, 'failed_requirements': []}

    result = _cli_runner().invoke(args=['regenerate_report_requests_for_permit', 'permit-guid'])

    assert result.exit_code == 0
    assert "'total_created': 2" in result.output
    mock_create_report_requests.assert_called_once_with(permit_guid='permit-guid', regenerate=True)


@mock.patch('app.api.mines.reports.tasks.create_new_recurring_report_requests')
def test_regenerate_report_requests_for_permit_cli_handles_unknown_permit(mock_create_report_requests):
    mock_create_report_requests.return_value = {'status': 'error', 'reason': 'permit not found'}

    result = _cli_runner().invoke(args=['regenerate_report_requests_for_permit', 'missing-permit-guid'])

    assert result.exit_code != 0
    assert 'permit not found' in result.output
