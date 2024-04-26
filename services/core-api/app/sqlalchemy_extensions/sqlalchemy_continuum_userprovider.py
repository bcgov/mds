from sqlalchemy_continuum.plugins import Plugin


def fetch_remote_addr():
    # We don't want to store any IP addresses in the database.
    return None

def fetch_remote_addr():
    # We don't want to store any IP addresses in the database.
    return None


class MDSSqlAlchemyContinuumPlugin(Plugin):
    def __init__(
        self,
        current_user_id_factory,
        remote_addr_factory=None
    ):
        self.current_user_id_factory = current_user_id_factory
        self.remote_addr_factory = (
            fetch_remote_addr if remote_addr_factory is None
            else remote_addr_factory
        )

    def transaction_args(self, uow, session):
        return {
            'user_id': self.current_user_id_factory(),
            'remote_addr': self.remote_addr_factory()
        }