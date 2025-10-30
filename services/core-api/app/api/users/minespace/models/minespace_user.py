from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from app.extensions import db

from app.api.utils.models_mixins import HistoryMixin, SoftDeleteMixin, Base, AuditMixin
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine


class MinespaceUser(HistoryMixin, SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'minespace_user'
    __versioned__ = {
        'exclude': ['last_logged_in']
    }

    user_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    bceid_username = db.Column(db.String(), nullable=False)

    # new data fields must all be nullable for legacy data
    sub = db.Column(db.String())
    email = db.Column(db.String())
    given_name = db.Column(db.String())
    family_name = db.Column(db.String())
    display_name = db.Column(db.String())
    identity_provider = db.Column(db.String())
    bceid_user_guid = db.Column(db.String())
    last_logged_in = db.Column(db.DateTime())

    minespace_user_mines = db.relationship('MinespaceUserMine', backref='user', lazy='joined')

    @hybrid_property
    def mines(self):
        return [x.mine_guid for x in self.minespace_user_mines]

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(user_id=id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_guid(cls, user_guid):
        return cls.query.filter_by(bceid_user_guid=user_guid).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(deleted_ind=False).join(MinespaceUserMine).filter(
            MinespaceUserMine.mine_guid == mine_guid
        ).all()

    @classmethod
    def find_by_username(cls, bceid_username):
        return cls.query.filter_by(bceid_username=bceid_username).filter_by(
            deleted_ind=False).first()

    @classmethod
    def create_minespace_user(cls, bceid_username, add_to_session=True):
        minespace_user = cls(bceid_username=bceid_username)
        if add_to_session:
            minespace_user.save(commit=False)
        return minespace_user

    @classmethod
    def find_by_token_data(cls, **kwargs):
        sub = kwargs.get("sub")
        bceid_username = kwargs.get("bceid_username")

        # if there is a user that has logged in with token data- return that user
        sub_user = cls.query.filter_by(sub=sub).filter_by(deleted_ind=False).first()
        if sub_user:
            return sub_user

        # otherwise look for an older record
        bceid_user = cls.find_by_username(bceid_username)

        return bceid_user

    @classmethod
    def update_from_token_data(cls, **kwargs):
        user = cls.find_by_token_data(**kwargs)

        if user is None:
            return

        for key, value in kwargs.items():
            setattr(user, key, value)
        user.save()

        return user


    @validates('bceid_username')
    def validate_username(self, key, bceid_username):
        if not bceid_username:
            raise AssertionError('Identifier is not provided.')
        if not bceid_username.endswith('@bceid'):
            raise AssertionError('BCeID username must end with "@bceid".')
        return bceid_username
    