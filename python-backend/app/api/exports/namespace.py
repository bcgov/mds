from flask_restplus import Namespace

from app.api.exports.mines.resources.mine_summary_csv_resource import MineSummaryCSVResource

api = Namespace('exports', description='Data dumps')

api.add_resource(MineSummaryCSVResource, '/mine-summary-csv')
