from flask_restx import Namespace

from app.api.verify.permit.now.resources.verify_permit_now_resource import VerifyPermitNOWResource
from app.api.verify.permit.mine.resources.verify_permit_mine_resource import VerifyPermitMineResource
from app.api.verify.mine.now.resources.verify_mine_now import VerifyMineNOWResource

api = Namespace('verify', description='Verification endpoints')

api.add_resource(VerifyPermitNOWResource, '/permit/now')
api.add_resource(VerifyPermitMineResource, '/permit/mine')
api.add_resource(VerifyMineNOWResource, '/mine/now')