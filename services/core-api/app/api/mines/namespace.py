from flask_restplus import Namespace

from app.api.mines.compliance.resources.compliance import MineComplianceSummaryResource
from app.api.mines.documents.resources.mine_document_resource import MineDocumentListResource
from app.api.mines.incidents.resources.mine_incidents import MineIncidentListResource, MineIncidentResource
from app.api.mines.incidents.resources.mine_incident_document import MineIncidentDocumentListResource, MineIncidentDocumentResource
from app.api.mines.mine.resources.mine_map import MineMapResource
from app.api.mines.mine.resources.mine import MineResource, MineListSearch, MineListResource
from app.api.mines.mine.resources.mine_type import MineTypeResource, MineTypeListResource
from app.api.mines.mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from app.api.mines.mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from app.api.mines.mine.resources.mine_commodity_code import MineCommodityCodeResource
from app.api.mines.mine.resources.mine_verified_status import MineVerifiedStatusResource, MineVerifiedStatusListResource
from app.api.mines.mine.resources.mine_basicinfo import MineBasicInfoResource
from app.api.mines.permits.permit.resources.permit import PermitResource, PermitListResource
from app.api.mines.permits.permit.resources.permit_status_code import PermitStatusCodeResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentListResource, PermitAmendmentDocumentResource
from app.api.mines.permits.permit.resources.permit_document_upload import PermitDocumentUploadInitializationResource
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.reports.resources.mine_report_document import MineReportDocumentListResource
from app.api.mines.reports.resources.reports_resource import ReportsResource
from app.api.mines.reports.resources.mine_reports import MineReportListResource, MineReportResource
from app.api.mines.reports.resources.mine_report_definition import MineReportDefinitionListResource
from app.api.mines.reports.resources.mine_report_submission_status import MineReportSubmissionStatusResource
from app.api.mines.reports.resources.mine_report_category import MineReportCategoryListResource
from app.api.mines.reports.resources.mine_report_comment import MineReportCommentResource, MineReportCommentListResource
from app.api.mines.status.resources.status import MineStatusXrefListResource
from app.api.mines.subscription.resources.subscription import MineSubscriptionResource, MineSubscriptionListResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityListResource
from app.api.mines.variances.resources.variance import MineVarianceResource
from app.api.mines.variances.resources.variance_list import MineVarianceListResource
from app.api.mines.variances.resources.variance_document_upload import MineVarianceDocumentUploadResource
from app.api.mines.variances.resources.variance_uploaded_documents import MineVarianceUploadedDocumentsResource
from app.api.parties.party_appt.resources.mine_party_appt_document_upload_resource import MinePartyApptDocumentUploadResource
from app.api.mines.comments.resources.mine_comment import MineCommentListResource, MineCommentResource

api = Namespace('mines', description='Mine related operations')

api.add_resource(MineResource, '/<string:mine_no_or_guid>')
api.add_resource(MineListResource, '')
api.add_resource(MineMapResource, '/map-list')

api.add_resource(MineListSearch, '/search')
api.add_resource(MineTenureTypeCodeResource, '/mine-tenure-type-codes')
api.add_resource(MineDisturbanceCodeResource, '/disturbance-codes')
api.add_resource(MineCommodityCodeResource, '/commodity-codes')
api.add_resource(MineStatusXrefListResource, '/status')
api.add_resource(MineRegionResource, '/region')

api.add_resource(MineTailingsStorageFacilityListResource, '/<string:mine_guid>/tailings')
api.add_resource(MineDocumentListResource, '/<string:mine_guid>/documents')

api.add_resource(MineComplianceSummaryResource, '/<string:mine_no>/compliance/summary')

api.add_resource(MineTypeResource, '/<string:mine_guid>/mine-types/<string:mine_type_guid>')
api.add_resource(MineTypeListResource, '/<string:mine_guid>/mine-types')

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

api.add_resource(
    MineIncidentDocumentResource,
    '/<string:mine_guid>/incidents/<string:mine_incident_guid>/documents/<string:mine_document_guid>'
)
api.add_resource(MineIncidentDocumentListResource, '/<string:mine_guid>/incidents/documents')

api.add_resource(ReportsResource, '/reports')
api.add_resource(MineReportListResource, '/<string:mine_guid>/reports')
api.add_resource(MineReportResource, '/<string:mine_guid>/reports/<string:mine_report_guid>')
api.add_resource(MineReportDefinitionListResource, '/reports/definitions')
api.add_resource(MineReportCommentListResource,
                 '/<string:mine_guid>/reports/<string:mine_report_guid>/comments')
api.add_resource(
    MineReportCommentResource,
    '/<string:mine_guid>/reports/<string:mine_report_guid>/comments/<string:mine_report_comment_guid>'
)
api.add_resource(MineReportSubmissionStatusResource, '/reports/status-codes')
api.add_resource(MineReportCategoryListResource, '/reports/category-codes')
api.add_resource(
    MineReportDocumentListResource,
    '/<string:mine_guid>/reports/documents',
)

api.add_resource(PermitResource, '/<string:mine_guid>/permits/<string:permit_guid>')
api.add_resource(PermitListResource, '/<string:mine_guid>/permits')
api.add_resource(PermitStatusCodeResource, '/permits/status-codes')

api.add_resource(PermitAmendmentListResource,
                 '/<string:mine_guid>/permits/<string:permit_guid>/amendments')
api.add_resource(
    PermitAmendmentResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

api.add_resource(
    PermitAmendmentDocumentListResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents',
)

api.add_resource(
    PermitDocumentUploadInitializationResource,
    '/<string:mine_guid>/permits/amendments/documents',
)
api.add_resource(
    PermitAmendmentDocumentResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/documents/<string:permit_amendment_document_guid>',
)

api.add_resource(MinePartyApptDocumentUploadResource,
                 '/<string:mine_guid>/party-appts/<string:mine_party_appt_guid>/documents')

api.add_resource(MineCommentListResource, '/<string:mine_guid>/comments')
api.add_resource(MineCommentResource, '/<string:mine_guid>/comments/<string:mine_comment_guid>')
