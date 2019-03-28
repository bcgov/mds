from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from ....utils.models_mixins import AuditMixin, Base
from app.extensions import db


class Variance(AuditMixin, Base):
    __tablename__ = "variance"
    variance_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    compliance_article_id = db.Column(db.Integer,
                                      db.ForeignKey('compliance_article.compliance_article_id'),
                                      server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    note = db.Column(db.String(300), server_default=FetchedValue())
    issue_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    received_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime,
                            nullable=False,
                            default=datetime.strptime('9999-12-31', '%Y-%m-%d'))


    def __repr__(self):
        return '<Variance %r>' % self.variance_id

    def json(self):
        return {
            'variance_id': self.variance_id,
            'compliance_article_id': self.compliance_article_id,
            'mine_guid': str(self.mine_guid),
            'note': self.note,
            'issue_date': self.issue_date.isoformat(),
            'received_date': self.received_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def create(cls,
               compliance_article_id,
               mine_guid,
               # Optional Params
               note=None,
               issue_date=None,
               received_date=None,
               expiry_date=None,
               save=True):
        new_variance = cls(
            compliance_article_id=compliance_article_id,
            mine_guid=mine_guid,
            note=note,
            issue_date=issue_date,
            received_date=received_date,
            expiry_date=expiry_date)
        if save:
            new_variance.save(commit=False)
        return new_variance

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter(str(mine_guid) == str(mine_guid)).all()

    @classmethod
    def find_by_variance_id(cls, variance_id):
        return cls.query.filter_by(variance_id=variance_id).first()
