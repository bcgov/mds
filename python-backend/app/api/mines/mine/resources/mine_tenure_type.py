from flask_restplus import Resource
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.mine_tenure_type import MineTenureType

class MineTenureTypeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        return { 'options': MineTenureType.all_options() }
