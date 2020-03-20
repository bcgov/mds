from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class PermitStatusCode(AuditMixin, Base):
    __tablename__ = 'permit_status_code'
    permit_status_code = db.Column(db.String(2), nullable=False, primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Permit %r>' % self.permit_status_code

    @classmethod
    def find_by_permit_status_code(cls, _id):
        return cls.query.filter_by(permit_status_code=_id).first()

    @classmethod
    def get_active(cls):
        return cls.query.all()
        #TODO put active ind on this table

    @validates('permit_status_code')
    def validate_permit_status_code(self, key, permit_status_code):
        if not permit_status_code:
            raise AssertionError('Permit status code is not provided.')
        if len(permit_status_code) > 2:
            raise AssertionError('Permit number must not exceed 1 characters.')
        return permit_status_code

    @validates('description')
    def validate_description(self, key, description):
        if not description:
            raise AssertionError('Permit status description is not provided.')
        if len(description) > 100:
            raise AssertionError('Permit status description must not exceed 100 characters.')
        return description
