from flask_restplus import Resource, reqparse
from app.api.utils.access_decorators import requires_role_view_all
from sqlalchemy import table, column, select

from app.extensions import api, db
from app.api.mines.response_models import MINES_MODEL
from app.api.mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin


class MineBasicInfoResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument('mine_guids',
                        type=list,
                        location="json",
                        help='List of guids for mines to get basic info for.')
    parser.add_argument('simple',
                        type=bool,
                        location="json",
                        help='Boolean indicator to determine if simple of full info is returned')

    @api.expect(parser)
    @api.marshal_with(MINES_MODEL, code=200)
    @api.doc(description='Returns a list of basic mine info.')
    @requires_role_view_all
    def post(self):

        data = self.parser.parse_args()
        mines = data.get('mine_guids', [])
        simple = data.get('simple', False)

        if not mines:
            return []

        if simple:
            mine_table = table(Mine.__tablename__, column('mine_guid'),
                               column('mine_name'), column('mine_no'),
                               column('deleted_ind'))

            mines_q = select([mine_table]).where(mine_table.c.deleted_ind == False)

            if mines:
                mines_q = mines_q.where(mine_table.c.mine_guid.in_(mines))

            connection = db.engine.connect()
            results = connection.execute(mines_q).fetchall()

            return results

        else:
            mine_list = Mine.query.filter(Mine.mine_guid.in_((mines))).all()
            return mine_list
