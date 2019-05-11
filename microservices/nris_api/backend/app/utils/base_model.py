from app.extensions import migrate
from flask import current_app


class Base(db.Model):
    __abstract__ = True
    #get base metadata
    metadata = migrate.db.metadata
    #add custom metadata value
    metadata["schema"] = "nris"
