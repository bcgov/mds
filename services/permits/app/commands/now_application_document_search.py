import click
from app.pipelines.document_search.create_search_index import (
    create_or_update_index,
)
from app.pipelines.document_search.create_search_indexer import (
    create_search_indexer,
)


@click.group()
def now_document_search():
    """Commands for managing NoW application document search infrastructure"""
    pass

@now_document_search.command()
def update_search_index():
    """Initialize or update the Azure Search index and indexer for NoW documents"""
    click.echo("Creating/updating NoW Document Azure Search index...")
    create_or_update_index()
    
    click.echo("Creating/updating NoW Document Azure Search indexer...")
    create_search_indexer()
    
    click.echo("NoW Document search infrastructure setup complete!")
