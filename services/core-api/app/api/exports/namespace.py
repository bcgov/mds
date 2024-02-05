from flask_restx import Namespace

from app.api.exports.mines.resources.mine_summary_resource import MineSummaryResource
from app.api.exports.mines.resources.mine_summary_csv_resource import MineSummaryCSVResource
from app.api.exports.now_application.resources.now_application_gis_export_resource import NowApplicationGisExportResource
from app.api.exports.static_content.resources.core_static_content_resource import StaticContentResource

api = Namespace('exports', description='Data dumps')

api.add_resource(MineSummaryCSVResource, '/mine-summary-csv')
api.add_resource(MineSummaryResource, '/mine-summary')
api.add_resource(NowApplicationGisExportResource, '/now-application-gis-export')
api.add_resource(StaticContentResource, '/core-static-content')
