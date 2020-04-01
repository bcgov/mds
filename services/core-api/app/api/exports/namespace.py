from flask_restplus import Namespace

from app.api.exports.mines.resources.mine_summary_csv_resource import MineSummaryCSVResource
from app.api.exports.static_content.resources.core_static_content_resource import StaticContentResource

api = Namespace('exports', description='Data dumps')

api.add_resource(MineSummaryCSVResource, '/mine-summary-csv')
api.add_resource(StaticContentResource, '/core-static-content')
