from datetime import datetime
from pytz import utc
from app.api.utils.models_mixins import SoftDeleteMixin, Base, AuditMixin
from app.extensions import db


class User(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "user"
    __versioned__ = {
        'exclude': ['last_logged_in']
    }

    sub = db.Column(db.String(), primary_key=True)
    email = db.Column(db.String(), nullable=False)
    given_name = db.Column(db.String(), nullable=False)
    family_name = db.Column(db.String(), nullable=False)
    display_name = db.Column(db.String(), nullable=False)
    idir_username = db.Column(db.String(), nullable=False)
    identity_provider = db.Column(db.String(), nullable=False)
    idir_user_guid = db.Column(db.String(), nullable=False)
    last_logged_in = db.Column(db.DateTime(), nullable=False)

    permit_condition_categories = db.relationship(
        'PermitConditionCategory',
        back_populates='assigned_review_user',
        cascade='all, delete-orphan'
    )

    def __repr__(self):
        return f'{self.__class__.__name__} {self.sub}'

    @classmethod
    def find_by_sub(cls, sub):
        return cls.query.filter_by(sub=sub).filter_by(deleted_ind=False).first()

    @classmethod
    def create(cls, **kwargs):
        kwargs['create_user'] = 'system'
        kwargs['create_timestamp'] = datetime.now(tz=utc)
        kwargs['update_user'] = 'system'
        kwargs['update_timestamp'] = datetime.now(tz=utc)

        user = cls(**kwargs)
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def create_or_update_user(cls, **kwargs):
        sub = kwargs.get("sub")
        existing_user = cls.find_by_sub(sub)

        if existing_user:
            # `last_logged_in` should always be updated
            existing_user.last_logged_in = datetime.now(tz=utc)

            # Update other fields only if there are changes
            for key, value in kwargs.items():
                if key not in ["sub", "last_logged_in"] and hasattr(existing_user, key):
                    current_value = getattr(existing_user, key)
                    if current_value != value:
                        setattr(existing_user, key, value)

            db.session.commit()
            result = existing_user

        else:
            # Create a new user if one does not already exist
            new_user = cls.create(**kwargs)
            result = new_user

        return result

    def update(self, **kwargs):
        # Add/Update attributes of the User instance
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)

        # Commit changes to the database
        db.session.commit()
        return self
