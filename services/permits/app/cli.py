import click
from app.commands.permit_condition_search import permit_condition_search
from app.commands.now_application_document_search import now_document_search


@click.group()
def cli():
    """MDS Permits Service CLI"""
    pass

cli.add_command(permit_condition_search)
cli.add_command(now_document_search)

if __name__ == '__main__':
    cli()
