def test_create_mines_cli(test_client, cli_runner):
    result = cli_runner.invoke(args=['create_data', '10'])
    assert result.output == 'Created 10 random mines.\n'


def test_delete_mines_cli(test_client, cli_runner):
    result = cli_runner.invoke(args=['delete_data'])
    assert result.output == 'Database has been cleared.\n'
