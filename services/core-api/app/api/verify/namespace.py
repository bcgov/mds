from flask_restplus import Namespace

from app.api.verify.mine.resources.verify_mine_resource import VerifyMineResource
from app.api.verify.permit.resources.verify_permit_resource import VerifyPermitResource

api = Namespace('verify', description='Verification endpoints')

api.add_resource(VerifyMineResource, '/mine')
api.add_resource(VerifyPermitResource, '/permit')
