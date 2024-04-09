from app.extensions import api
from flask_restx import fields

MINE_INFO = api.model(
    'MineInfo', {
        'mine_guid': fields.String,
        'summary': fields.String,
        'projects': fields.Raw,
    })

EPIC_MINE_INFO = api.model(
    'EpicMineInfo', {
        'mine_info': fields.Nested(MINE_INFO),
    })
