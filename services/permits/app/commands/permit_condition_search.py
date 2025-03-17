import click
from app.pipelines.permit_condition_search.create_search_index import (
    create_or_update_index,
)
from app.pipelines.permit_condition_search.create_search_indexer import (
    create_search_indexer,
)


@click.group()
def permit_condition_search():
    """Commands for managing permit condition search infrastructure"""
    pass

@permit_condition_search.command()
def update_search_index():
    """Initialize or update the Azure Search index and indexer"""
    click.echo("Creating/updating Azure Search index...")
    create_or_update_index()
    
    click.echo("Creating/updating Azure Search indexer...")
    create_search_indexer()
    
    click.echo("Search infrastructure setup complete!")
