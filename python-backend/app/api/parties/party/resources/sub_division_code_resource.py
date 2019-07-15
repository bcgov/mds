from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.sub_division_code import SubDivisionCode

class SubDivisionCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={})
    @requires_role_view_all
    def get(self):
        return { 'records': SubDivisionCode.all_options() }
