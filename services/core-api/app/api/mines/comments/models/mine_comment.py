from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from app.api.utils.include.user_info import User
from datetime import datetime


class MineComment(Base, AuditMixin):
    __tablename__ = "mine_comment"
    mine_comment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_comment_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    mine_guid = db.Column(db.Integer, db.ForeignKey('mine.mine_guid'), nullable=False)
    mine_comment = db.Column(db.String, nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, default=False)

    comment_user = db.Column(nullable=False, default=User().get_user_username)
    comment_datetime = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MineComment %r>' % self.mine_comment_guid

    @classmethod
    def create(cls, mine, mine_comment, add_to_session=True):
        new_comment = cls(mine_comment=mine_comment)
        mine.comments.append(new_comment)

        if add_to_session:
            new_comment.save(commit=False)
        return new_comment

    @classmethod
    def find_by_guid(cls, _id):
        return cls.query.filter_by(mine_comment_guid=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).all()