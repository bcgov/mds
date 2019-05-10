from app.extensions import db
from flask import current_app


class Base(db.Model):
    __abstract__ = True
    #get base metadata
    metadata = current_app.extensions['migrate'].db.metadata
    #add custom metadata value
    metadata["schema"] = "nris"
