from flask import request, Response
from flask_restplus import Resource, reqparse
from sqlalchemy import cast, String
from sqlalchemy.sql.functions import coalesce

from ..models.mine import Mine

from app.extensions import api
from ....utils.access_decorators import requires_role_view_all


class MineCSVResource(Resource):
    @api.doc(description='Returns a CSV of basic mine info.')
    @requires_role_view_all
    def get(self):
        q = Mine.query.with_entities(cast(Mine.mine_guid, String), coalesce(cast(Mine.mine_name, String), ''), cast(Mine.mine_no, String), cast(Mine.major_mine_ind, String), coalesce(cast(Mine.mine_region, String), '')).limit(10).all()
        rows = ["\""+'","'.join(r)+"\"" for r in q]
        csv = '\n'.join(rows)


        return Response(csv, mimetype='text/csv')        
        # return Response(q, mimetype='text/csv')


    #         @classmethod
    # def to_csv(cls, records, columns):
    #     rows = [','.join(columns)]
    #     for record in records:
    #         row = []
    #         for column in columns:
    #             row.append(str(getattr(record, column)))
    #         rows.append(','.join(row))
    #     return '\n'.join(rows)