from flask_restplus import Namespace

from app.api.mines.mine.resources.mine_map import MineMapResource
from ..mine.resources.mine import MineResource, MineListSearch, MineListResource
from ..mine.resources.mine_type import MineTypeResource, MineTypeListResource
from ..mine.resources.mine_type_detail import MineTypeDetailResource
from ..mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from ..mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from ..mine.resources.mine_commodity_code import MineCommodityCodeResource
from ..status.resources.status import MineStatusResource
from ..region.resources.region import MineRegionResource
from ..tailings.resources.tailings import MineTailingsStorageFacilityListResource
from ..compliance.resources.compliance import MineComplianceSummaryResource
from ..compliance.resources.compliance_article import ComplianceArticleResource
from ..mine.resources.mine_basicinfo import MineBasicInfoResource
from app.api.mines.mine.resources.mine_verified_status import MineVerifiedStatusResource, MineVerifiedStatusListResource
from ..subscription.resources.subscription import MineSubscriptionResource, MineSubscriptionListResource
from ..variances.resources.variance import VarianceResource
from ..variances.resources.variance_list import VarianceListResource
from ..variances.resources.variance_document_upload import VarianceDocumentUploadResource
from ..variances.resources.variance_uploaded_documents import VarianceUploadedDocumentsResource
from ..incidents.resources.mine_incidents import MineIncidentListResource, MineIncidentResource
from ..incidents.resources.mine_incident_followup_types import MineIncidentFollowupTypeResource
from ..incidents.resources.mine_incident_determination_types import MineIncidentDeterminationTypeResource

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

api.add_resource(MineComplianceSummaryResource, '/<string:mine_no>/compliance/summary')
api.add_resource(ComplianceArticleResource, '/compliance/codes')

api.add_resource(MineTypeResource, '/mine-types/<string:mine_type_guid>')
api.add_resource(MineTypeListResource, '/mine-types')

api.add_resource(MineTypeDetailResource, '/mine-types/details',
                 '/mine-types/details/<string:mine_type_detail_xref_guid>')

api.add_resource(MineBasicInfoResource, '/basicinfo')
api.add_resource(MineVerifiedStatusResource, '/<string:mine_guid>/verified-status')
api.add_resource(MineVerifiedStatusListResource, '/verified-status')
api.add_resource(MineSubscriptionResource, '/<string:mine_guid>/subscribe')
api.add_resource(MineSubscriptionListResource, '/subscribe')

api.add_resource(VarianceListResource, '/<string:mine_guid>/variances')
api.add_resource(VarianceResource, '/<string:mine_guid>/variances/<string:variance_guid>')
api.add_resource(VarianceDocumentUploadResource,
                 '/<string:mine_guid>/variances/<string:variance_guid>/documents')
api.add_resource(
    VarianceUploadedDocumentsResource,
    '/<string:mine_guid>/variances/<string:variance_guid>/documents/<string:mine_document_guid>')

api.add_resource(MineIncidentListResource, '/<string:mine_guid>/incidents')
api.add_resource(MineIncidentResource, '/incidents/<string:mine_incident_guid>')

api.add_resource(MineIncidentFollowupTypeResource, '/incidents/followup-types')
api.add_resource(MineIncidentDeterminationTypeResource, '/incidents/determination-types')
