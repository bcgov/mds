from app.extensions import api
from flask_restx import Resource

from .permit_condition_extraction_resource import (
    PermitConditionExtractionProgressResource,
    PermitConditionExtractionResource,
)
from .permit_extraction_dashboard import PermitExtractionDashboardResource

api.add_resource(PermitConditionExtractionResource,
                 '/mines/permits/permit-conditions/extraction',
                 '/mines/permits/permit-conditions/extraction/')
api.add_resource(PermitConditionExtractionProgressResource,
                 '/mines/permits/permit-conditions/extraction/<string:task_id>',
                 '/mines/permits/permit-conditions/extraction/<string:task_id>/')
api.add_resource(PermitExtractionDashboardResource,
                 '/mines/permits/permit-conditions/extraction/dashboard',
                 '/mines/permits/permit-conditions/extraction/dashboard/')
