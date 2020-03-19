from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class DocumentNDA(Base):
    __tablename__ = "document_nda"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application_nda.messageid'))
    documenturl = db.Column(db.String)
    filename = db.Column(db.String)
    documenttype = db.Column(db.String)
    description = db.Column(db.String)

    def __repr__(self):
        return '<DocumentNDA %r>' % self.id
