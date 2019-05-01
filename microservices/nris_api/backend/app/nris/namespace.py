from flask_restplus import Namespace
from app.nris.resources.test_resource import FactorialResource

factorial_ns = Namespace('factorial', description='factorial related operations')

factorial_ns.add_resource(FactorialResource, '/<int:input_val>')