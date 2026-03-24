import uuid
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import or_, and_
from app.extensions import db
from app.api.services.css_sso_service import CSSService
from app.api.utils.access_decorators import MINESPACE_PROPONENT_COMPOSITE_ROLE

from app.api.utils.models_mixins import HistoryMixin, SoftDeleteMixin, Base, AuditMixin
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.minespace.models.minespace_user_request import MinespaceUserRequest
from app.api.users.minespace.models.minespace_user_role_xref import MinespaceUserRoleXref


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
    user_roles = db.relationship('MinespaceUserRoleXref', backref='user', lazy='select', 
                                  primaryjoin="and_(MinespaceUser.user_id==MinespaceUserRoleXref.minespace_user_id, MinespaceUserRoleXref.deleted_ind==False)")
    documents = db.relationship('MinespaceUserDocumentXref', backref='user', lazy='select',
                                primaryjoin="and_(MinespaceUser.user_id==MinespaceUserDocumentXref.minespace_user_id, MinespaceUserDocumentXref.deleted_ind==False)")
    access_request = db.relationship('MinespaceUserRequest', backref='minespace_user', uselist=False, lazy='select',
                                     foreign_keys='MinespaceUserRequest.minespace_user_id')

    @hybrid_property
    def mines(self):
        return [x.mine_guid for x in self.minespace_user_mines]

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(deleted_ind=False).all()
    
    @classmethod
    def get_all_with_requests(cls, include_rejected=False):
        """
        Get all users with their access requests.
        Includes:
        - All users who have access requests with status 0 (pending) or 1 (approved)
        
        Filters out:
        - Rejected requests (unless include_rejected=True)
        
        Args:
            include_rejected: Whether to include users with rejected requests (status=2)
        
        Returns:
            List of MinespaceUser objects. Each user may have an access_request relationship populated (or None).
        """
        
        query = cls.query.filter_by(deleted_ind=False).outerjoin(
            MinespaceUserRequest, cls.user_id == MinespaceUserRequest.minespace_user_id
        )
        
        # Filter out rejected requests if needed
        if not include_rejected:
            query = query.filter(
                or_(
                    MinespaceUserRequest.request_status != 2,
                    MinespaceUserRequest.request_status.is_(None)
                )
            )
        
        return query.all()
    
    @classmethod
    def get_pending(cls):
        """Get all users with pending access requests (status=0)"""
        return cls.query.filter_by(deleted_ind=False).join(
            MinespaceUserRequest, cls.user_id == MinespaceUserRequest.minespace_user_id
        ).filter(
            MinespaceUserRequest.request_status == 0
        ).all()

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
        # Check if a soft-deleted user exists with this username
        deleted_user = cls.query.filter_by(bceid_username=bceid_username).filter_by(deleted_ind=True).first()
        
        if deleted_user:
            # Un-delete the user by setting deleted_ind to False
            deleted_user.deleted_ind = False
            if add_to_session:
                deleted_user.save(commit=False)
            return deleted_user
        
        # Create new user if no deleted user exists
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

    def grant_keycloak_access(self):
        """Grant MINESPACE_PROPONENT composite role to this user in Keycloak via CSS SSO API"""
        
        if not self.sub:
            raise ValueError('Cannot grant keycloak access: user has no sub (keycloak username)')
        
        success = CSSService.assign_roles_to_user(self.sub, [MINESPACE_PROPONENT_COMPOSITE_ROLE])
        
        if not success:
            raise Exception(f'Failed to grant keycloak access to user {self.sub}')
        
        return success

    def revoke_keycloak_access(self):
        """Revoke all Keycloak roles from this user via CSS SSO API"""
        
        if not self.sub:
            raise ValueError('Cannot revoke keycloak access: user has no sub (keycloak username)')
        
        # Get all current roles for this user
        current_roles = CSSService.get_roles_by_user(self.sub)
        
        if not current_roles:
            # No roles to revoke
            return True
        
        # Delete each role
        failed_roles = []
        for role_name in current_roles:
            success = CSSService.delete_user_role_mapping(self.sub, role_name)
            if not success:
                failed_roles.append(role_name)
        
        if failed_roles:
            raise Exception(f'Failed to revoke roles {failed_roles} from user {self.sub}')
        
        return True

    def create_user_role_xrefs(self, mine_guids, role_code, is_pending=False):
        """
        Create MinespaceUserRoleXref records for this user for the specified mines and role.
        
        Args:
            mine_guids: List of mine GUIDs to create role xrefs for
            role_code: The role code (AGT, HSR, MMG, PMT, CON, OTH)
            is_pending: Whether the role is pending approval (default False)
        """
        for mine_guid in mine_guids:
            role_xref = MinespaceUserRoleXref(
                minespace_user_id=self.user_id,
                minespace_user_role_code=role_code,
                mine_guid=mine_guid,
                is_pending=is_pending
            )
            role_xref.save(commit=False)
        
        db.session.commit()
    
    def update_user_roles(self, user_roles_list):
        """
        Update user role xrefs based on provided list.
        Only modifies roles that have actually changed to preserve audit trail.
        
        Args:
            user_roles_list: List of dicts with keys: mine_guid, minespace_user_role_code, is_pending, minespace_user_role_xref_guid (optional)
        """
        # Build set of existing xref_guids that should be kept
        requested_xref_guids = {item.get('minespace_user_role_xref_guid') for item in user_roles_list if item.get('minespace_user_role_xref_guid')}
        
        # Delete xrefs that are no longer in the request
        for role_xref in self.user_roles:
            if str(role_xref.minespace_user_role_xref_guid) not in requested_xref_guids:
                role_xref.delete()
        
        # Add or update roles
        for role_data in user_roles_list:
            if role_data.get('minespace_user_role_xref_guid'):
                # Existing role - update if needed
                role_xref = next(
                    (r for r in self.user_roles 
                     if str(r.minespace_user_role_xref_guid) == role_data['minespace_user_role_xref_guid']), 
                    None
                )
                if role_xref:
                    role_xref.is_pending = role_data.get('is_pending', False)
            else:
                # New role - create it
                new_role_xref = MinespaceUserRoleXref(
                    minespace_user_id=self.user_id,
                    minespace_user_role_code=role_data['minespace_user_role_code'],
                    mine_guid=uuid.UUID(role_data['mine_guid']),
                    is_pending=role_data.get('is_pending', False)
                )
                new_role_xref.save(commit=False)
        
        db.session.commit()

    @validates('bceid_username')
    def validate_username(self, key, bceid_username):
        if not bceid_username:
            raise AssertionError('Identifier is not provided.')
        if not bceid_username.endswith('@bceid'):
            raise AssertionError('BCeID username must end with "@bceid".')
        return bceid_username
    