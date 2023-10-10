from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, SoftDeleteMixin
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from app.api.constants import *


class Document(SoftDeleteMixin, Base):
    __tablename__ = "document"
    __table_args__ = {"schema": "now_submissions"}
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    documenturl = db.Column(db.String)
    filename = db.Column(db.String)
    documenttype = db.Column(db.String)
    description = db.Column(db.String)

    def __repr__(self):
        return '<Document %r>' % self.id

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(id=id).one_or_none()
    
    @classmethod
    def find_by_messageid_and_filename(cls, messageid, filename):
        return cls.query.filter_by(messageid=messageid, filename=filename).first()
    
    def delete(self, commit=True):
        super(Document, self).delete(commit)