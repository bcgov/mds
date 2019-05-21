from flask_restplus import Namespace

from app.nris.etl.resources.nris_etl_resource import NRISETLResource

api = Namespace('nris', description='Mine related operations')

api.add_resource(NRISETLResource, '')