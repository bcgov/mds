import click
from app.commands.permit_condition_search import permit_condition_search


@click.group()
def cli():
    """MDS Permits Service CLI"""
    pass

cli.add_command(permit_condition_search)

if __name__ == '__main__':
    cli()
