import uuid

from flask import request, current_app
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.users.response_models import MINESPACE_USER_MODEL
from app.api.mines.mine.models.mine import Mine


class MinespaceUserListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('email_or_username', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)

    @api.doc(params={
        'email_or_username': 'find by email, this will return a list with at most one element'
    })
    @api.marshal_with(MINESPACE_USER_MODEL, envelope='records')
    @requires_role_mine_admin
    def get(self):
        if request.args.get('email_or_username'):
            ms_users = [MinespaceUser.find_by_email(request.args.get('email_or_username'))]
        else:
            ms_users = MinespaceUser.get_all()
        return ms_users

    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def post(self):
        data = self.parser.parse_args()
        new_user = MinespaceUser.create_minespace_user(data.get('email_or_username'))
        new_user.save()
        for guid in data.get('mine_guids'):
            guid = uuid.UUID(guid)               #ensure good formatting
            new_mum = MinespaceUserMine.create(new_user.user_id, guid)
            new_mum.save()
        return new_user


class MinespaceUserResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('email_or_username', type=str, location='json', required=True)
    parser.add_argument('mine_guids', type=list, location='json', required=True)
    
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
        for um in user.minespace_user_mines:
            db.session.delete(um)
        db.session.commit()
        db.session.delete(user)
        db.session.commit()
        return ('', 204)

    @api.doc(description='Update an existing Minespace Users mine list')
    @api.marshal_with(MINESPACE_USER_MODEL)
    @requires_role_mine_admin
    def put(self, user_id):
        contact = MinespaceUser.find_by_id(user_id)
        if not contact:
            raise NotFound('Contact not found.')
        data = self.parser.parse_args()
        if not data.get('mine_guids'):
            raise BadRequest('Empty list mine_guids is not permitted. Please provide a list of mine GUIDS.')

        current_app.logger.debug('Mine list found, checking for new mines')
        existing_mines = contact.mines
       
        # Cycle through list of mines. Mines have to exist before being added to the user.
        for guid in data.get('mine_guids'):
            mine = Mine.find_by_mine_guid(guid)
            if mine:
                current_app.logger.debug('Found mine with guid: {}'.format(guid))
                MinespaceUserMine.create(user_id, mine.mine_guid)     
            elif mine in existing_mines:
                continue # Mine already exists, do nothing
            else:
                raise NotFound('Mine with guid {} not found.'.format(guid))

        contact.save()
        return contact
        