import uuid

from flask import request, current_app
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from werkzeug.exceptions import NotFound

class MinespaceUserMine(Base):
    __tablename__ = 'minespace_user_mds_mine_access'

    user_id = db.Column(db.Integer, db.ForeignKey('minespace_user.user_id'), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False, primary_key=True)

    @classmethod
    def create(cls, user_id, mine_guid, add_to_session=True):
        minespace_user = cls(user_id=user_id, mine_guid=mine_guid)
        if add_to_session:
            minespace_user.save(commit=False)
        return minespace_user

    @classmethod
    def find_by_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).first()

    
    def delete(self):
        current_app.logger.debug('foooo mine')
        print('Delete mine')
        db.session.delete(self)

        # minespace_user_mine = cls.find_by_guid(mine_guid)
        # if minespace_user_mine is None:
        #     raise NotFound('MinespaceUserMine not found')
       
        
        # db.session.delete(minespace_user_mine)
        db.session.commit()
        return None, 204
