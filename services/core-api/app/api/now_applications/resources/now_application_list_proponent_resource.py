from flask import request
from flask_restx import Resource, inputs
from sqlalchemy import func, or_, and_
from sqlalchemy_filters import apply_pagination, apply_sort
from werkzeug.exceptions import BadRequest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.now_applications.models.applications_view import ApplicationsView
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.resources.now_application_base_list_resource import NowApplicationBaseListResource
from app.api.now_applications.response_models import NOW_VIEW_MODEL_PROPONENT
from app.api.utils.access_decorators import requires_role_edit_permit, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
    
class NOWApplicationListProponentResource(NowApplicationBaseListResource):
    
    @api.doc(description='Get a list of Core Notice of Work applications for a particular mine proponent', params={})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(NOW_VIEW_MODEL_PROPONENT, code=200)
    def get(self, mine_guid):
        print( mine_guid)
        return ApplicationsView.query.filter_by(mine_guid = mine_guid).all()