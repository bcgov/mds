from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base, AuditMixin
from sqlalchemy import asc
from app.extensions import db


class MineReportCategory(Base, AuditMixin):
    __tablename__ = 'mine_report_category'
    mine_report_category = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineReportCategory %r>' % self.mine_report_category

    @classmethod
    def get_active(cls):
        try:
            return cls.query.filter_by(active_ind=True).order_by(asc(cls.display_order)).all()
        except ValueError:
            return None