from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.api.regions.models.regions import Regions
from app.api.regions.response_models import REGION
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class RegionListResource(Resource, UserMixin):
    @api.doc(
        description="List all regions",
    )
    @api.marshal_with(REGION, code=200, as_list=True)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        regions = Regions.get_all()
        if not regions:
            raise NotFound('Region not found')
        return regions
