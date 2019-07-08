from flask_restplus import Namespace

from app.api.mines.mine.resources.mine_map import MineMapResource
from ..mine.resources.mine import MineResource, MineListSearch, MineListResource
from ..mine.resources.mine_type import MineTypeResource, MineTypeListResource
from ..mine.resources.mine_type_detail import MineTypeDetailResource
from ..mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from ..mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from ..mine.resources.mine_commodity_code import MineCommodityCodeResource
from ..status.resources.status import MineStatusResource, MineStatusListResource
from ..region.resources.region import MineRegionResource
from ..tailings.resources.tailings import MineTailingsStorageFacilityListResource
from ..compliance.resources.compliance import MineComplianceSummaryResource
from ..compliance.resources.compliance_article import ComplianceArticleResource
from ..mine.resources.mine_basicinfo import MineBasicInfoResource
from app.api.mines.mine.resources.mine_verified_status import MineVerifiedStatusResource, MineVerifiedStatusListResource
from ..subscription.resources.subscription import MineSubscriptionResource, MineSubscriptionListResource
from ..variances.resources.variance import MineVarianceResource
from ..variances.resources.variance_list import MineVarianceListResource
from ..variances.resources.variance_document_upload import MineVarianceDocumentUploadResource
from ..variances.resources.variance_uploaded_documents import MineVarianceUploadedDocumentsResource
from ..incidents.resources.mine_incidents import MineIncidentListResource, MineIncidentResource
from ..incidents.resources.mine_incident_status_codes import MineIncidentStatusCodeResource
from ..incidents.resources.mine_incident_followup_types import MineIncidentFollowupTypeResource
from ..incidents.resources.mine_incident_determination_types import MineIncidentDeterminationTypeResource
from ..incidents.resources.mine_incident_document import MineIncidentDocumentListResource, MineIncidentDocumentResource
from app.api.mines.permits.permit.resources.permit import PermitResource, PermitListResource
from app.api.mines.permits.permit.resources.permit_status_code import PermitStatusCodeResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentListResource, PermitAmendmentDocumentResource

from flask_restplus import Namespace


api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '/<string:mine_no_or_guid>')
api.add_resource(MineListResource, '')
api.add_resource(MineMapResource, '/map-list')

api.add_resource(MineListSearch, '/search')
api.add_resource(MineTenureTypeCodeResource, '/mine-tenure-type-codes')
api.add_resource(MineDisturbanceCodeResource, '/disturbance-codes')
api.add_resource(MineCommodityCodeResource, '/commodity-codes')
api.add_resource(MineStatusResource, '/status/<string:mine_status_guid>')
api.add_resource(MineStatusListResource, '/status')
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

api.add_resource(MineVarianceListResource, '/<string:mine_guid>/variances')
api.add_resource(MineVarianceResource, '/<string:mine_guid>/variances/<string:variance_guid>')
api.add_resource(MineVarianceDocumentUploadResource,
                 '/<string:mine_guid>/variances/<string:variance_guid>/documents')
api.add_resource(
    MineVarianceUploadedDocumentsResource,
    '/<string:mine_guid>/variances/<string:variance_guid>/documents/<string:mine_document_guid>')

api.add_resource(MineIncidentListResource, '/<string:mine_guid>/incidents')
api.add_resource(MineIncidentResource, '/<string:mine_guid>/incidents/<string:mine_incident_guid>')

api.add_resource(MineIncidentFollowupTypeResource, '/incidents/followup-types')
api.add_resource(MineIncidentDeterminationTypeResource, '/incidents/determination-types')
api.add_resource(MineIncidentStatusCodeResource, '/incidents/status-codes')

api.add_resource(
    MineIncidentDocumentResource,
    '/<string:mine_guid>/incidents/<string:mine_incident_guid>/documents/<string:mine_document_guid>'
)
api.add_resource(MineIncidentDocumentListResource, '/<string:mine_guid>/incidents/documents')

api.add_resource(PermitResource, '/<string:mine_guid>/permits/<string:permit_guid>')
api.add_resource(PermitListResource, '/<string:mine_guid>/permits')
api.add_resource(PermitStatusCodeResource, '/permits/status-codes')

api.add_resource(PermitAmendmentListResource, '/<string:mine_guid>/permits/<string:permit_guid>/amendments')
api.add_resource(PermitAmendmentResource,
                 '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

api.add_resource(
    PermitAmendmentDocumentListResource,
    '/<string:mine_guid>/permits/amendments/documents',
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
)
api.add_resource(
    PermitAmendmentDocumentResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:permit_amendment_document_guid>',
)
