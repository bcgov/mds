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
                            server_default=FetchedValue())


    def __repr__(self):
        return '<VarianceDocument %r>' % self.variance_document_xref_guid

    def json(self):
        return {
            'variance_document_xref_guid': str(self.variance_document_xref_guid),
            'variance_id': self.variance_id,
            'mine_document_guid': str(self.mine_document_guid)
        }

    @classmethod
    def create(cls,
               mine_document_guid,
               variance_id,
               save=True):
        document = cls(variance_id=variance_id, mine_document_guid=mine_document_guid)
        if save:
            document.save(commit=False)
        return document

    @classmethod
    def find_by_mine_document_guid(cls, mine_document_guid):
        return cls.query.filter(str(mine_document_guid) == str(mine_document_guid)).first()

    @classmethod
    def find_by_variance_id(cls, variance_id):
        return cls.query.filter_by(variance_id=variance_id).all()
