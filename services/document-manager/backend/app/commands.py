from app.services.transfer_files import transfer_local_files_to_object_store


def register_commands(app):
    @app.cli.command()
    def transfer_files():
        print("Beginning transfer of files to object store...")
        transfer_local_files_to_object_store()
        print("Transfer task created.")
