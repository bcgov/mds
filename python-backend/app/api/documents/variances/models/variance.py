from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from ....utils.models_mixins import Base
from app.extensions import db

class VarianceDocument(Base):
    __tablename__ = "variance_document_xref"
    variance_document_xref_guid = db.Column(UUID(as_uuid=True),
                                            primary_key=True,
                                            server_default=FetchedValue())
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   db.ForeignKey('mine_document.mine_document_guid'))
    variance_id = db.Column(db.Integer,
                            db.ForeignKey('variance.variance_id'),
                            server_default=FetchedValue())

    def __repr__(self):
        return '<VarianceDocument %r>' % self.variance_document_xref_guid
