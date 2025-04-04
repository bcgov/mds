from app.api.mines.permits.permit_conditions.resources.permit_conditions_search_resource import (
    PermitConditionsSearchResource,
)
from app.api.search.search.resources.search import SearchOptionsResource, SearchResource
from app.api.search.search.resources.simple_search import SimpleSearchResource
from flask_restx import Namespace

api = Namespace('search', description='Search related operations')

api.add_resource(SearchResource, '')
api.add_resource(SearchOptionsResource, '/options')
api.add_resource(SimpleSearchResource, '/simple')
api.add_resource(PermitConditionsSearchResource, '/permit-conditions')