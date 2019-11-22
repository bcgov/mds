from flask_restplus import Namespace

from app.api.exports.mines.resources.mine_csv_resource import MineCSVResource

api = Namespace('exports', description='Data dumps')

api.add_resource(MineCSVResource, '/mine-status-types-permits-csv')
