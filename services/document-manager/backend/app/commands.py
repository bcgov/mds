import click


def register_commands(app):
    @app.cli.command()
    @click.argument('wait', default=False)
    def transfer_files(wait):
        """Transfer documents that exist at their full_storage_path to the object store."""
        from app.services.commands_helper import transfer_local_files_to_object_store
        print(transfer_local_files_to_object_store(wait))

    @app.cli.command()
    @click.argument('wait', default=False)
    def verify_files(wait):
        """Verify that documents that exist at their full_storage_path equal the file stored at their object_store_path."""
        from app.services.commands_helper import verify_transferred_objects
        print(verify_transferred_objects(wait))

    @app.cli.command()
    @click.argument('wait', default=False)
    def reorganize_files(wait):
        """Reorganize documents on the object store so that their key includes their full_storage_path."""
        from app.services.commands_helper import reorganize_files
        print(reorganize_files(wait))

    @app.cli.command()
    @click.argument('path', default=False)
    def untransferred_files(path):
        """Get documents that have no object_store_path set."""
        from app.services.commands_helper import get_untransferred_files
        print(get_untransferred_files(path))

    @app.cli.command()
    @click.argument('path', default=False)
    def missing_files(path):
        """Get documents that do not exist at their full_storage_path."""
        from app.services.commands_helper import get_missing_files
        print(get_missing_files(path))

    @app.cli.command()
    @click.argument('path')
    def unregistered_files(path):
        """Get files under the provided path that do not have a document record with it as its full_storage_path."""
        from app.services.commands_helper import get_unregistered_files
        print(get_unregistered_files(path))
