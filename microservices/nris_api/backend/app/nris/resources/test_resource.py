from flask_restplus import Resource, Namespace, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.utils.logger import get_logger
from app.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ..models.test_model import Factorial

factorial_model = api.model('Factorial', {
    'input_val': fields.Integer,
    'output_val': fields.Integer,
    'exec_timestamp': fields.DateTime,
})


def _factorial(n):
    if n < 2:
        return 1
    return _factorial(n - 1) + n


class FactorialResource(Resource):
    @api.marshal_with(factorial_model, envelope='records', code=200)
    @api.doc(description='returns the factorial of the provided value.')
    def get(self, input_val):
        input_val = int(input_val)
        fact = Factorial.query.filter_by(input_val=input_val).first()
        if not fact:
            fact = Factorial(input_val=input_val, output_val=_factorial(input_val))
            if fact.output_val < 1:
                raise InternalServerError("Calculation Error")
            db.session.add(fact)
            db.session.commit()
        get_logger().debug(fact)
        return fact
