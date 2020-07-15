import click


def register_commands(app):
    @app.cli.command()
    @click.argument('wait', default=False)
    def transfer_files(wait):
        from app.services.transfer_files import transfer_local_files_to_object_store
        print(transfer_local_files_to_object_store(wait))

    @app.cli.command()
    @click.argument('wait', default=False)
    def verify_files(wait):
        from app.services.transfer_files import verify_transferred_objects
        print(verify_transferred_objects(wait))

    @app.cli.command()
    def untransferred_files():
        from app.services.transfer_files import get_untransferred_files
        print(get_untransferred_files())
