from flask_restplus import Resource
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_tenure_type_code import MineTenureTypeCode

class MineTenureTypeCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={})
    @requires_role_mine_view
    def get(self):
        return { 'options': MineTenureTypeCode.all_options() }
