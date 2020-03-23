from flask_restplus import Namespace

from app.api.verify.permit.now.resources.verify_permit_now_resource import VerifyPermitNOWResource
from app.api.verify.permit.mine.resources.verify_permit_mine_resource import VerifyPermitMineResource

api = Namespace('verify', description='Verification endpoints')

api.add_resource(VerifyPermitNOWResource, '/permit/now')
api.add_resource(VerifyPermitMineResource, '/permit/mine')
