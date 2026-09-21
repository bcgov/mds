import uuid

from flask import request, current_app
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound
from app.extensions import getJwtManager

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin, VIEW_ALL, requires_any_of, MINESPACE_PROPONENT, MINE_ADMIN
from app.api.utils.resources_mixins import UserMixin

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.response_models import MINESPACE_USER_MODEL
from app.api.mines.mine.models.mine import Mine


class MinespaceUserListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)
    parser.add_argument('bceid_username', type=str, location='json', required=False)

    @api.doc(params={
        'mine_guid': 'find by mine guid, this will return all users with access to the specified mine',
        'include_rejected': 'include users with explicitly rejected requests (default: false)'
    })
    @api.marshal_with(MINESPACE_USER_MODEL, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        mine_guid = request.args.get('mine_guid')
        include_rejected = request.args.get('include_rejected', 'false').lower() == 'true'
        is_admin = getJwtManager().contains_role([MINE_ADMIN])

        if not is_admin and mine_guid is None:
            raise BadRequest("mine_guid is a required argument")
        elif mine_guid:
            mine = Mine.find_by_mine_guid(mine_guid)
            if not mine:
                raise NotFound('Mine not found')
            ms_users = MinespaceUser.find_by_mine_guid(mine_guid)
        else:
            ms_users = MinespaceUser.get_all_with_requests(include_rejected=include_rejected)
        
        return ms_users

    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def post(self):
        data = self.parser.parse_args()
        new_user = MinespaceUser.create_minespace_user(data.get('bceid_username'))
        
        # If this is a restored user, clear all old relationships
        if new_user.user_id:  # user_id exists means it's a restored user
            # Clear old user_role xrefs (they're soft-deleted, so filter by deleted_ind=False)
            for role_xref in new_user.user_roles:
                if not role_xref.deleted_ind:
                    role_xref.delete()
            
            # Clear old mine relationships
            for um in new_user.minespace_user_mines:
                db.session.delete(um)
            
            db.session.commit()
        
        new_user.save()
        for guid in data.get('mine_guids'):
            guid = uuid.UUID(guid)               #ensure good formatting
            new_mum = MinespaceUserMine.create(new_user.user_id, guid)
            new_mum.save()
        return new_user


class MinespaceUserResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('bceid_username', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)
    parser.add_argument('access_request', type=dict, location='json', required=False)
    parser.add_argument('user_roles', type=list, location='json', required=False)
    
    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def get(self, user_id):
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            raise NotFound("user not found")
        return user

    @requires_role_mine_admin
    def delete(self, user_id):
        user = MinespaceUser.find_by_id(user_id)
        if not user:
            raise NotFound("user not found")
        
        # Revoke all keycloak roles first
        try:
            user.revoke_keycloak_access()
            current_app.logger.info(f'Revoked keycloak access for user {user_id}')
        except Exception as e:
            current_app.logger.error(f'Failed to revoke keycloak access for user {user_id}: {str(e)}')
            # Continue with deletion even if keycloak revocation fails
        
        # Delete all user_role xrefs
        for role_xref in user.user_roles:
            role_xref.delete()
        
        # Delete all user_mine relationships
        for um in user.minespace_user_mines:
            db.session.delete(um)
        
        # Delete all user documents
        for doc in user.documents:
            db.session.delete(doc)
        
        # Delete access request if it exists
        if user.access_request:
            db.session.delete(user.access_request)
        
        db.session.commit()
        
        # Finally, soft delete the user
        user.delete()
        
        return ('', 204)

    @api.doc(description='Update an existing Minespace User, including mine list, pending status, and roles')
    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def put(self, user_id):
        contact = MinespaceUser.find_by_id(user_id)
        if not contact:
            raise NotFound('Contact not found.')
        data = self.parser.parse_args()

        if data.get('bceid_username'):
            if contact.bceid_username != data.get('bceid_username'):
                contact.bceid_username = data.get('bceid_username')
        
        # Update access_request.request_status if provided and grant keycloak access if approved
        was_pending = contact.access_request and contact.access_request.request_status == 0
        access_request_data = data.get('access_request')
        if access_request_data and contact.access_request:
            new_status = access_request_data.get('request_status')
            if new_status is not None:
                contact.access_request.request_status = new_status
                
                # If user was pending and is now approved, grant keycloak access
                if was_pending and new_status == 1:
                    try:
                        contact.grant_keycloak_access()
                        current_app.logger.info(f'Granted keycloak access to user {contact.user_id}')
                    except Exception as e:
                        current_app.logger.error(f'Failed to grant keycloak access to user {contact.user_id}: {str(e)}')
                        raise BadRequest(f'Failed to grant keycloak access to user: {contact.bceid_username}')
                
                # If user is rejected, revoke keycloak access and remove all mine/role access
                elif new_status == 2:
                    try:
                        contact.revoke_keycloak_access()
                        current_app.logger.info(f'Revoked keycloak access for rejected user {contact.user_id}')
                    except Exception as e:
                        current_app.logger.error(f'Failed to revoke keycloak access for user {contact.user_id}: {str(e)}')
                    
                    # Remove all user_role xrefs
                    for role_xref in contact.user_roles:
                        if not role_xref.deleted_ind:
                            role_xref.delete()
                    
                    # Remove all mine relationships
                    for um in contact.minespace_user_mines:
                        db.session.delete(um)
                    
                    contact.save()
                    # Return early - don't process mine_guids or user_roles for rejected users
                    return contact

        updated_mines = data.get('mine_guids')
        if not updated_mines:
            raise BadRequest('Empty list mine_guids is not permitted. Please provide a list of mine GUIDS.')

        existing_mines = contact.mines # list of mines already existing in the user's mine list

        for delete_mine in existing_mines:
            if str(delete_mine) not in updated_mines:
                minespace_user_mine = MinespaceUserMine.find_by_minespace_user_mine_relationship(delete_mine, user_id)
                if minespace_user_mine:  
                    minespace_user_mine.delete()

        # Cycle through list of mines. Mines have to exist before being added to the user.
        for guid in updated_mines:
            mine = Mine.find_by_mine_guid(guid)
            if not mine:
                raise NotFound('Mine with guid {} not found.'.format(guid))
            existing_minespace_user_mine = MinespaceUserMine.find_by_minespace_user_mine_relationship(guid, user_id)
            current_app.logger.info('Existing Mine: {}'.format(existing_minespace_user_mine))
            if not existing_minespace_user_mine:
                MinespaceUserMine.create(user_id, mine.mine_guid)
        
        # Handle user_roles updates if provided
        # Format: [{mine_guid, minespace_user_role_code, is_pending, minespace_user_role_xref_guid}]
        if data.get('user_roles') is not None:
            # Verify all mines in user_roles exist before updating
            for role_data in data.get('user_roles'):
                mine = Mine.find_by_mine_guid(role_data['mine_guid'])
                if not mine:
                    raise NotFound(f'Mine with guid {role_data["mine_guid"]} not found.')
            
            contact.update_user_roles(data.get('user_roles'))
        
        contact.save()
        return contact

        