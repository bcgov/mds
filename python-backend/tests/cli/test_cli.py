import pytest

# TODO: Confirm that this still needs to be skipepd. Update to pass if possible
@pytest.mark.skip(reason='not successing on first test suite run')
def test_create_mines_cli(test_client, cli_runner):
    result = cli_runner.invoke(args=['create_data', '10', 'False'])
    assert result.exit_code == 0
    assert "Created" in result.output
