import pytest
from click.testing import CliRunner
from unittest.mock import patch
from app.cli import cli

def test_cli_base():
    runner = CliRunner()
    result = runner.invoke(cli, ['--help'])
    assert result.exit_code == 0
    assert 'MDS Permits Service CLI' in result.output

@patch('app.commands.now_application_document_search.create_or_update_index')
def test_now_document_search_update_index(mock_create):
    runner = CliRunner()
    result = runner.invoke(cli, ['now-document-search', 'update-search-index'])
    assert result.exit_code == 0
    assert 'Creating/updating NoW Document Azure Search index...' in result.output
    mock_create.assert_called_once()

@patch('app.commands.permit_condition_search.create_or_update_index')
@patch('app.commands.permit_condition_search.create_search_indexer')
def test_permit_condition_search_update_index(mock_create_indexer, mock_create_index):
    runner = CliRunner()
    result = runner.invoke(cli, ['permit-condition-search', 'update-search-index'])
    assert result.exit_code == 0
    assert 'Creating/updating Azure Search index...' in result.output
    mock_create_index.assert_called_once()
    mock_create_indexer.assert_called_once()
