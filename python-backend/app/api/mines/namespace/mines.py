from flask_restplus import Namespace

from app.api.mines.mine.resources.mine_map import MineMapResource
from ..mine.resources.mine import MineResource, MineListSearch, MineListResource
from ..mine.resources.mine_type import MineTypeResource
from ..mine.resources.mine_type_detail import MineTypeDetailResource
from ..mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from ..mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from ..mine.resources.mine_commodity_code import MineCommodityCodeResource
from ..status.resources.status import MineStatusResource
from ..region.resources.region import MineRegionResource
from ..tailings.resources.tailings import MineTailingsStorageFacilityListResource
from ..compliance.resources.compliance import MineComplianceResource
from ..compliance.resources.compliance_article import ComplianceArticleResource
from ..mine.resources.mine_basicinfo import MineBasicInfoResource
from ..subscription.resources.subscription import MineSubscriptionResource, MineSubscriptionListResource
from app.api.mines.mine.resources.mine_verified_status import MineVerifiedStatusResource
from ..variances.resources.variance import (VarianceListResource, VarianceResource,
                                            VarianceDocumentUploadResource,
                                            VarianceUploadedDocumentsResource)

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '/<string:mine_no_or_guid>')
api.add_resource(MineListResource, '')
api.add_resource(MineMapResource, '/map-list')

api.add_resource(MineListSearch, '/search')
api.add_resource(MineTenureTypeCodeResource, '/mine-tenure-type-codes')
api.add_resource(MineDisturbanceCodeResource, '/disturbance-codes')
api.add_resource(MineCommodityCodeResource, '/commodity-codes')
api.add_resource(MineStatusResource, '/status', '/status/<string:mine_status_guid>')
api.add_resource(MineRegionResource, '/region', '/region/<string:mine_region_guid>')

api.add_resource(MineTailingsStorageFacilityListResource, '/<string:mine_guid>/tailings')

api.add_resource(MineComplianceResource, '/compliance', '/compliance/<string:mine_no>')
api.add_resource(ComplianceArticleResource, '/compliance/codes')
api.add_resource(MineTypeResource, '/mine-types', '/mine-types/<string:mine_type_guid>')
api.add_resource(MineTypeDetailResource, '/mine-types/details',
                 '/mine-types/details/<string:mine_type_detail_xref_guid>')
api.add_resource(MineBasicInfoResource, '/basicinfo')
api.add_resource(MineSubscriptionResource, '/<string:mine_guid>/subscribe')
api.add_resource(MineSubscriptionListResource, '/subscribe')
api.add_resource(MineVerifiedStatusResource, '/verified-status',
                 '/<string:mine_guid>/verified-status')

api.add_resource(VarianceListResource, '/<string:mine_guid>/variances')
api.add_resource(VarianceResource, '/<string:mine_guid>/variances/<string:variance_id>')
api.add_resource(VarianceDocumentUploadResource,
                 '/<string:mine_guid>/variances/<string:variance_id>/documents')
api.add_resource(
    VarianceUploadedDocumentsResource,
    '/<string:mine_guid>/variances/<string:variance_id>/documents/<string:mine_document_guid>')
