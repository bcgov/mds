#!/usr/bin/env python
"""
Command Line Interface for Document Manager
This module defines CLI commands that can be called using the Flask CLI
"""
import sys

import click
from app.services.vfcbc_download_service import VFCBCDownloadService
from flask.cli import with_appcontext


@click.group(name='document')
def document_cli():
    """Document manager commands."""
    pass


@document_cli.command('vfcbc-download')
@click.argument('url')
@click.argument('output')
@with_appcontext
def vfcbc_download_command(url, output):
    """Download a file from VFCBC.
    
    URL: The URL of the file to download
    OUTPUT: Path where the downloaded file will be saved

    Example Usage: flask document vfcbc-download https://j200.gov.bc.ca/int/vfcbc/Download.aspx?PosseObjectId=<OBJ_ID> FIGURE1.pdf
    """
    try:
        # Use download method with use_cache=False to bypass caching
        file_data = VFCBCDownloadService.download(url, use_cache=False)
        with open(output, 'wb') as f:
            f.write(file_data.getbuffer())
        click.echo(f"File successfully downloaded and saved to {output}")
    except Exception as e:
        click.echo(f"Error downloading file: {e}", err=True)
        sys.exit(1)
