from app.auth import get_user_username
from sqlalchemy_continuum import make_versioned
from .sqlalchemy_continuum_userprovider import MDSSqlAlchemyContinuumPlugin


def register_sqlalchemy_continuum():
    # Register the sqlalchemy-continuum extension.
    # Any models with the __versioned__ attribute will be versioned automatically on
    # inserts, updates, and deletes.
    make_versioned(user_cls=None, plugins=[MDSSqlAlchemyContinuumPlugin(
        current_user_id_factory=get_user_username
    )])
