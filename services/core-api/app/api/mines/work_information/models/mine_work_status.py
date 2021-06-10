from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineWorkStatus(Base, AuditMixin):
    __tablename__ = 'mine_work_status'

    mine_work_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'{self.__class__.__name__} {self.mine_work_status_code}'

    @classmethod
    def find_by_mine_work_status_code(cls, mine_work_status_code):
        return cls.query.filter_by(mine_work_status_code=mine_work_status_code).one_or_none()

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.display_order).all()

    @classmethod
    def get_active(cls):
        return cls.query.order_by(cls.display_order).filter_by(active_ind=True).all()
