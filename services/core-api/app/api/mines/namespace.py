from flask_restx import Namespace

from app.api.mines.documents.resources.mine_document_version_resource import MineDocumentVersionListResource, MineDocumentVersionUploadResource
from app.api.mines.compliance.resources.compliance import MineComplianceSummaryResource
from app.api.mines.documents.resources.mine_document_resource import MineDocumentListResource, MineDocumentArchiveResource, ZipResource, ZipProgressResource, DocumentUploadStatusResource
from app.api.mines.explosives_permit_amendment.resources.explosives_permit_amendment import \
    ExplosivesPermitAmendmentResource
from app.api.mines.explosives_permit_amendment.resources.explosives_permit_amendment_list import \
    ExplosivesPermitAmendmentListResource
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
from app.api.mines.permits.permit_amendment.resources.permit_amendment_vc import PermitAmendmentVCResource
from app.api.mines.permits.permit.resources.permit_document_upload import PermitDocumentUploadInitializationResource
from app.api.mines.explosives_permit.resources.explosives_permit import ExplosivesPermitResource
from app.api.mines.explosives_permit.resources.explosives_permit_list import ExplosivesPermitListResource
from app.api.mines.explosives_permit.resources.explosives_permit_document_upload import ExplosivesPermitDocumentUploadResource
from app.api.mines.explosives_permit.resources.explosives_permit_document_type import ExplosivesPermitDocumentTypeResource, ExplosivesPermitDocumentTypeListResource, ExplosivesPermitDocumentGenerateResource
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.reports.resources.mine_report_definition_compliance_article_xref_resource import \
    MineReportDefinitionComplianceArticleCreateResource, MineReportDefinitionComplianceArticleUpdateResource
from app.api.mines.reports.resources.mine_report_document import MineReportDocumentListResource
from app.api.mines.reports.resources.reports_resource import ReportsResource
from app.api.mines.reports.resources.mine_reports import MineReportListResource, MineReportResource
from app.api.mines.reports.resources.mine_report_submission_resource import ReportSubmissionResource
from app.api.mines.reports.resources.mine_report_definition import MineReportDefinitionListResource
from app.api.mines.reports.resources.mine_report_submission_status import MineReportSubmissionStatusResource
from app.api.mines.reports.resources.mine_report_category import MineReportCategoryListResource
from app.api.mines.reports.resources.mine_report_comment import MineReportCommentResource, MineReportCommentListResource
from app.api.mines.status.resources.status import MineStatusXrefListResource
from app.api.mines.subscription.resources.subscription import MineSubscriptionResource, MineSubscriptionListResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityResource
from app.api.mines.tailings.resources.tailings_list import MineTailingsStorageFacilityListResource
from app.api.mines.variances.resources.variance import MineVarianceResource
from app.api.mines.variances.resources.variance_list import MineVarianceListResource
from app.api.mines.variances.resources.variance_document_upload import MineVarianceDocumentUploadResource
from app.api.mines.variances.resources.variance_uploaded_documents import MineVarianceUploadedDocumentsResource
from app.api.parties.party_appt.resources.mine_party_appt_document_upload_resource import MinePartyApptDocumentUploadResource
from app.api.mines.comments.resources.mine_comment import MineCommentListResource, MineCommentResource
from app.api.mines.permits.permit_conditions.resources.permit_conditions_resource import PermitConditionsListResource, PermitConditionsResource
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_resource import StandardPermitConditionsResource
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_list_resource import StandardPermitConditionsListResource
from app.api.mines.permits.permit_conditions.resources.permit_condition_category_resource import PermitConditionCategoryResource
from app.api.mines.permits.permit_conditions.resources.permit_condition_type_resource import PermitConditionTypeResource
from app.api.mines.work_information.resources.work_information_list import MineWorkInformationListResource
from app.api.mines.work_information.resources.work_information import MineWorkInformationResource
from app.api.mines.external_authorizations.resources.epic_resource import EPICResource
from app.api.notice_of_departure.resources.notice_of_departure_document import MineNoticeOfDepartureNewDocumentUploadResource
from app.api.mines.alerts.resources.mine_alert import MineAlertListResource, MineAlertResource, GlobalMineAlertListResource

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
api.add_resource(MineTailingsStorageFacilityResource,
                 '/<string:mine_guid>/tailings/<string:mine_tailings_storage_facility_guid>')
api.add_resource(MineDocumentListResource, '/<string:mine_guid>/documents')
api.add_resource(MineDocumentArchiveResource, '/<string:mine_guid>/documents/archive')
api.add_resource(MineDocumentVersionUploadResource, '/<string:mine_guid>/documents/<string:mine_document_guid>/versions/upload')
api.add_resource(MineDocumentVersionListResource, '/<string:mine_guid>/documents/<string:mine_document_guid>/versions')

api.add_resource(ZipResource, '/<string:mine_guid>/documents/zip')
api.add_resource(ZipProgressResource, '/documents/zip/<string:task_id>')

api.add_resource(DocumentUploadStatusResource, '/documents/upload/<string:mine_document_guid>')

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

api.add_resource(MineWorkInformationListResource, '/<string:mine_guid>/work-information')
api.add_resource(MineWorkInformationResource,
                 '/<string:mine_guid>/work-information/<string:mine_work_information_guid>')

api.add_resource(
    MineIncidentDocumentResource,
    '/<string:mine_guid>/incidents/<string:mine_incident_guid>/documents/<string:mine_document_guid>'
)
api.add_resource(MineIncidentDocumentListResource, '/<string:mine_guid>/incidents/documents')

api.add_resource(ReportsResource, '/reports')
api.add_resource(MineReportListResource, '/<string:mine_guid>/reports')
api.add_resource(MineReportResource, '/<string:mine_guid>/reports/<string:mine_report_guid>')
api.add_resource(ReportSubmissionResource, '/reports/submissions')
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
api.add_resource(PermitConditionCategoryResource, '/permits/condition-category-codes')
api.add_resource(PermitConditionTypeResource, '/permits/condition-type-codes')

api.add_resource(StandardPermitConditionsListResource,
                 '/permits/standard-conditions/<string:notice_of_work_type>')
api.add_resource(StandardPermitConditionsResource,
                 '/permits/standard-conditions/<string:standard_permit_condition_guid>')

api.add_resource(PermitAmendmentListResource,
                 '/<string:mine_guid>/permits/<string:permit_guid>/amendments')
api.add_resource(
    PermitAmendmentResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>')

api.add_resource(
    PermitAmendmentVCResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/verifiable-credential'
)

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

api.add_resource(
    PermitConditionsListResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/conditions',
)
api.add_resource(
    PermitConditionsResource,
    '/<string:mine_guid>/permits/<string:permit_guid>/amendments/<string:permit_amendment_guid>/conditions/<string:permit_condition_guid>',
)

api.add_resource(ExplosivesPermitAmendmentResource,
                 '/<string:mine_guid>/explosives-permits-amendment/<string:explosives_permit_amendment_guid>')
api.add_resource(ExplosivesPermitAmendmentListResource,
                 '/<string:mine_guid>/explosives-permits-amendment')
api.add_resource(ExplosivesPermitResource,
                 '/<string:mine_guid>/explosives-permits/<string:explosives_permit_guid>')
api.add_resource(ExplosivesPermitListResource, '/<string:mine_guid>/explosives-permits')
api.add_resource(
    ExplosivesPermitDocumentUploadResource,
    '/<string:mine_guid>/explosives-permits/<string:explosives_permit_guid>/documents')
api.add_resource(ExplosivesPermitDocumentTypeListResource, '/explosives-permit-document-types')
api.add_resource(ExplosivesPermitDocumentTypeResource,
                 '/explosives-permit-document-types/<string:document_type_code>')
api.add_resource(ExplosivesPermitDocumentGenerateResource,
                 '/explosives-permit-document-types/<string:document_type_code>/generate')

api.add_resource(MinePartyApptDocumentUploadResource,
                 '/<string:mine_guid>/party-appts/<string:mine_party_appt_guid>/documents')

api.add_resource(MineCommentListResource, '/<string:mine_guid>/comments')
api.add_resource(MineCommentResource, '/<string:mine_guid>/comments/<string:mine_comment_guid>')

api.add_resource(EPICResource, '/<string:mine_guid>/epic')

api.add_resource(MineNoticeOfDepartureNewDocumentUploadResource, '/<string:mine_guid>/notices-of-departure/documents')

api.add_resource(MineAlertListResource, '/<string:mine_guid>/alerts')
api.add_resource(MineAlertResource, '/<string:mine_guid>/alerts/<string:mine_alert_guid>')
api.add_resource(GlobalMineAlertListResource, '/global-alerts')

api.add_resource(MineReportDefinitionComplianceArticleCreateResource, '/reports/definitions/compliance-article')
api.add_resource(MineReportDefinitionComplianceArticleUpdateResource,
                 '/reports/definitions/compliance-article/<string:mine_report_definition_compliance_article_xref_guid>')
