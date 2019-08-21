import click
from now_etls.etl import now_etl


@click.group()
def cli(ctx):
    """Command line interface for the greet package"""
    pass


@cli.command()
def command():
    pass


if __name__ == '__main__':
    cli()
