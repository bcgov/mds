import click
from app.pipelines.document_search.create_search_index import (
    create_or_update_index,
)


@click.group()
def now_document_search():
    """Commands for managing NoW application document search infrastructure"""
    pass


@now_document_search.command()
def update_search_index():
    """Initialize or update the Azure Search index for NoW documents.

    Only the index itself needs to be created — the push-based indexing approach
    does not require a data source, skillset, or indexer. Documents are embedded
    and pushed directly to the index by the haystack service at indexing time.
    """
    click.echo("Creating/updating NoW Document Azure Search index...")
    create_or_update_index()
    click.echo("NoW Document search infrastructure setup complete!")
