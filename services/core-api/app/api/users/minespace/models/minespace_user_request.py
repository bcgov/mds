from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from pytz import utc

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class MinespaceUserRequest(AuditMixin, Base):
    __tablename__ = 'minespace_user_request'

    minespace_user_request_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    user_sub = db.Column(db.String(255), unique=True, nullable=False)
    minespace_user_id = db.Column(db.Integer, db.ForeignKey('minespace_user.user_id'), nullable=True)
    submitted_timestamp = db.Column(db.DateTime, nullable=False)
    role_requested = db.Column(db.String(3), db.ForeignKey('minespace_user_role.minespace_user_role_code'), nullable=True)
    business_name = db.Column(db.String(255), nullable=True)
    access_request_text = db.Column(db.String(100), nullable=True)
    ministry_contact = db.Column(db.String(100), nullable=True)
    permittee = db.Column(JSONB, nullable=True)
    request_status = db.Column(db.SmallInteger, nullable=False, server_default=FetchedValue())

    @classmethod
    def find_by_user_sub(cls, user_sub):
        """Find a request by the user's sub (from JWT token)"""
        return cls.query.filter_by(user_sub=user_sub).first()

    @classmethod
    def create_or_update_request(cls, user_sub, data={}, is_submitting=False):
        """
        Create a new request or update an existing one.
        
        Args:
            user_sub: The user's sub claim from JWT token
            data: Dict containing request fields (optional, defaults to empty dict)
            is_submitting: Whether this is a final submission (sets submitted_timestamp)
        
        Returns:
            MinespaceUserRequest instance
        """
        existing_request = cls.find_by_user_sub(user_sub)
        
        if existing_request:
            # Update existing request with any provided fields
            existing_request.role_requested = data.get('role_requested', existing_request.role_requested)
            existing_request.business_name = data.get('business_name', existing_request.business_name)
            existing_request.access_request_text = data.get('access_request_text', existing_request.access_request_text)
            existing_request.ministry_contact = data.get('ministry_contact', existing_request.ministry_contact)
            existing_request.permittee = data.get('permittee', existing_request.permittee)
            
            # Only set submitted_timestamp if this is a final submission and it hasn't been set yet
            if is_submitting and not existing_request.submitted_timestamp:
                existing_request.submitted_timestamp = datetime.now(tz=utc)
            
            existing_request.save()
            return existing_request
        else:
            # Create new request - role_requested is required for new requests
            new_request = cls(
                user_sub=user_sub,
                role_requested=data.get('role_requested'),
                business_name=data.get('business_name'),
                access_request_text=data.get('access_request_text'),
                ministry_contact=data.get('ministry_contact'),
                permittee=data.get('permittee'),
                submitted_timestamp=datetime.now(tz=utc) if is_submitting else None
            )
            new_request.save()
            return new_request

    def link_to_user(self, minespace_user_id):
        """Link this request to a minespace_user once the user is created"""
        self.minespace_user_id = minespace_user_id
        self.save()
