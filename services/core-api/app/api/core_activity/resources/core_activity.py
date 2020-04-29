from flask_restplus import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.utils.core_activity_engine import CoreActivityEngine
from app.api.core_activity.response_models import CORE_ACTIVITY

class CoreActivityListResource(Resource, UserMixin):
    @api.doc(description='Get Core Activities',
        params={'published_since': 'Activities that have been published since this date',
        'published_before': 'Activities that have been published before this date'})
    #@requires_role_view_all
    @api.marshal_with(CORE_ACTIVITY, envelope='records', code=200)
    def get(self):

        published_since = request.args.get('published_since')
        published_before = request.args.get('published_before')

        if not published_since:
            raise BadRequest('published_since is a required query parameter')

        return CoreActivityEngine.get(published_since, published_before)
