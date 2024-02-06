from flask_restx import Namespace

from app.api.search.search.resources.search import SearchResource, SearchOptionsResource
from app.api.search.search.resources.simple_search import SimpleSearchResource

api = Namespace('search', description='Search related operations')

api.add_resource(SearchResource, '')
api.add_resource(SearchOptionsResource, '/options')
api.add_resource(SimpleSearchResource, '/simple')