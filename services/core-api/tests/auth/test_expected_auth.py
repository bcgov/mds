import pytest
from app.api.activity.resource.activities_mark_as_read import ActivityMarkAsReadResource
from app.api.activity.resource.activity_list import ActivityListResource
from app.api.compliance.resources.compliance_article import ComplianceArticleResource
from app.api.compliance.resources.compliance_article_create_resource import (
    ComplianceArticleCreateResource,
)
from app.api.compliance.resources.compliance_article_update_resource import (
    ComplianceArticleUpdateResource,
)
from app.api.compliance.resources.compliance_document_resource import (
    ComplianceDocumentTokenResource,
)
from app.api.dams.resources.dam import DamResource
from app.api.dams.resources.dam_list import DamListResource
from app.api.download_token.resources.download_token import DownloadTokenResource
from app.api.exports.mines.resources.mine_summary_csv_resource import (
    MineSummaryCSVResource,
)
from app.api.exports.mines.resources.mine_summary_resource import MineSummaryResource
from app.api.exports.now_application.resources.now_application_gis_export_resource import (
    NowApplicationGisExportResource,
)
from app.api.exports.static_content.resources.core_static_content_resource import (
    StaticContentResource,
)
from app.api.help.resources.help_resource import HelpListResource, HelpResource
from app.api.incidents.resources.incidents_resource import IncidentsResource
from app.api.incidents.resources.mine_incident_category import (
    MineIncidentCategoryResource,
)
from app.api.incidents.resources.mine_incident_determination_types import (
    MineIncidentDeterminationTypeResource,
)
from app.api.incidents.resources.mine_incident_document_type_codes import (
    MineIncidentDocumentTypeCodeResource,
)
from app.api.incidents.resources.mine_incident_followup_types import (
    MineIncidentFollowupTypeResource,
)
from app.api.incidents.resources.mine_incident_notes import (
    MineIncidentNoteListResource,
    MineIncidentNoteResource,
)
from app.api.incidents.resources.mine_incident_status_codes import (
    MineIncidentStatusCodeResource,
)
from app.api.mines.alerts.resources.mine_alert import (
    GlobalMineAlertListResource,
    MineAlertListResource,
    MineAlertResource,
)
from app.api.mines.comments.resources.mine_comment import (
    MineCommentListResource,
    MineCommentResource,
)
from app.api.mines.compliance.resources.compliance import MineComplianceSummaryResource
from app.api.mines.documents.resources.mine_document_bundle import (
    MineDocumentBundleResource,
)
from app.api.mines.documents.resources.mine_document_resource import (
    DocumentUploadStatusResource,
    MineDocumentArchiveResource,
    MineDocumentListResource,
    ZipProgressResource,
    ZipResource,
)
from app.api.mines.documents.resources.mine_document_version_resource import (
    MineDocumentVersionListResource,
    MineDocumentVersionUploadResource,
)
from app.api.mines.explosives_permit.resources.explosives_permit import (
    ExplosivesPermitResource,
)
from app.api.mines.explosives_permit.resources.explosives_permit_document_type import (
    ExplosivesPermitDocumentGenerateResource,
    ExplosivesPermitDocumentTypeListResource,
    ExplosivesPermitDocumentTypeResource,
)
from app.api.mines.explosives_permit.resources.explosives_permit_document_upload import (
    ExplosivesPermitDocumentUploadResource,
)
from app.api.mines.explosives_permit.resources.explosives_permit_list import (
    ExplosivesPermitListResource,
)
from app.api.mines.explosives_permit_amendment.resources.explosives_permit_amendment import (
    ExplosivesPermitAmendmentResource,
)
from app.api.mines.explosives_permit_amendment.resources.explosives_permit_amendment_list import (
    ExplosivesPermitAmendmentListResource,
)
from app.api.mines.external_authorizations.resources.epic_resource import EPICResource
from app.api.mines.incidents.resources.mine_incident_document import (
    MineIncidentDocumentListResource,
    MineIncidentDocumentResource,
)
from app.api.mines.incidents.resources.mine_incidents import (
    MineIncidentListResource,
    MineIncidentResource,
)
from app.api.mines.mine.resources.mine import (
    MineListResource,
    MineListSearch,
    MineResource,
)
from app.api.mines.mine.resources.mine_basicinfo import MineBasicInfoResource
from app.api.mines.mine.resources.mine_commodity_code import MineCommodityCodeResource
from app.api.mines.mine.resources.mine_disturbance_code import (
    MineDisturbanceCodeResource,
)
from app.api.mines.mine.resources.mine_map import MineMapResource
from app.api.mines.mine.resources.mine_tenure_type_code import (
    MineTenureTypeCodeResource,
)
from app.api.mines.mine.resources.mine_type import (
    MineTypeListResource,
    MineTypeResource,
)
from app.api.mines.mine.resources.mine_verified_status import (
    MineVerifiedStatusListResource,
    MineVerifiedStatusResource,
)
from app.api.mines.permits.permit.resources.permit import (
    PermitListResource,
    PermitResource,
)
from app.api.mines.permits.permit.resources.permit_document_upload import (
    PermitDocumentUploadInitializationResource,
)
from app.api.mines.permits.permit.resources.permit_status_code import (
    PermitStatusCodeResource,
)
from app.api.mines.permits.permit_amendment.resources.permit_amendment import (
    PermitAmendmentListResource,
    PermitAmendmentResource,
)
from app.api.mines.permits.permit_amendment.resources.permit_amendment_diff import (
    PermitAmendmentDiffResource,
)
from app.api.mines.permits.permit_amendment.resources.permit_amendment_document import (
    PermitAmendmentDocumentListResource,
    PermitAmendmentDocumentResource,
)
from app.api.mines.permits.permit_amendment.resources.permit_amendment_vc import (
    PermitAmendmentVCResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_amendment_condition_category_list_resource import (
    PermitAmendmentConditionCategoryListResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_amendment_condition_category_resource import (
    PermitAmendmentConditionCategoryResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_amendment_condition_category_user_resource import (
    AssignUserToPermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.resources.permit_condition_category_resource import (
    PermitConditionCategoryResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_condition_tag_resource import (
    PermitConditionTagResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_condition_template_resource import (
    PermitConditionTemplateResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_condition_type_resource import (
    PermitConditionTypeResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_conditions_resource import (
    PermitConditionsListResource,
    PermitConditionsResource,
)
from app.api.mines.permits.permit_conditions.resources.permit_conditions_search_resource import (
    PermitConditionsSearchResource,
)
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_list_resource import (
    StandardPermitConditionsListResource,
)
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_resource import (
    StandardPermitConditionsResource,
)
from app.api.mines.permits.permit_conditions.resources.standard_report_permit_requirement_resource import (
    StandardReportPermitRequirementResource,
)
from app.api.mines.permits.permit_extraction.resources.permit_condition_extraction_resource import (
    PermitConditionExtractionProgressResource,
    PermitConditionExtractionResource,
)
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.reports.resources.mine_report_category import (
    MineReportCategoryListResource,
)
from app.api.mines.reports.resources.mine_report_comment import (
    MineReportCommentListResource,
    MineReportCommentResource,
)
from app.api.mines.reports.resources.mine_report_definition_compliance_article_xref_resource import (
    MineReportDefinitionComplianceArticleCreateResource,
    MineReportDefinitionComplianceArticleUpdateResource,
)
from app.api.mines.reports.resources.mine_report_definition_list_resource import (
    MineReportDefinitionListResource,
)
from app.api.mines.reports.resources.mine_report_definition_resource import (
    MineReportDefinitionResource,
)
from app.api.mines.reports.resources.mine_report_document import (
    MineReportDocumentListResource,
)
from app.api.mines.reports.resources.mine_report_due_date_type_resource import (
    MineReportDueDateTypeResource,
)
from app.api.mines.reports.resources.mine_report_permit_requirement import (
    MineReportPermitRequirementResource,
)
from app.api.mines.reports.resources.mine_report_submission_resource import (
    ReportSubmissionResource,
)
from app.api.mines.reports.resources.mine_report_submission_status import (
    MineReportSubmissionStatusResource,
)
from app.api.mines.reports.resources.mine_reports import (
    MineReportListResource,
    MineReportResource,
)
from app.api.mines.reports.resources.reports_resource import ReportsResource
from app.api.mines.status.resources.status import MineStatusXrefListResource
from app.api.mines.subscription.resources.subscription import (
    MineSubscriptionListResource,
    MineSubscriptionResource,
)
from app.api.mines.tailings.resources.tailings import (
    MineTailingsStorageFacilityResource,
)
from app.api.mines.tailings.resources.tailings_list import (
    MineTailingsStorageFacilityListResource,
)
from app.api.mines.variances.resources.variance import MineVarianceResource
from app.api.mines.variances.resources.variance_document_upload import (
    MineVarianceDocumentUploadResource,
)
from app.api.mines.variances.resources.variance_list import MineVarianceListResource
from app.api.mines.variances.resources.variance_uploaded_documents import (
    MineVarianceUploadedDocumentsResource,
)
from app.api.mines.work_information.resources.work_information import (
    MineWorkInformationResource,
)
from app.api.mines.work_information.resources.work_information_list import (
    MineWorkInformationListResource,
)
from app.api.ministry_contacts.resources.ministry_contact import MinistryContactResource
from app.api.ministry_contacts.resources.ministry_contact_list import (
    MinistryContactListResource,
)
from app.api.notice_of_departure.resources.notice_of_departure import (
    NoticeOfDepartureResource,
)
from app.api.notice_of_departure.resources.notice_of_departure_document import (
    MineNoticeOfDepartureDocumentResource,
    MineNoticeOfDepartureDocumentUploadResource,
    MineNoticeOfDepartureNewDocumentUploadResource,
)
from app.api.notice_of_departure.resources.notice_of_departure_list import (
    NoticeOfDepartureListResource,
)
from app.api.now_applications.resources.administrative_amendment_list_resource import (
    AdministrativeAmendmentListResource,
)
from app.api.now_applications.resources.now_activity_type_resource import (
    NOWActivityTypeResource,
)
from app.api.now_applications.resources.now_application_delay_resource import (
    NOWApplicationDelayListResource,
    NOWApplicationDelayResource,
    NOWApplicationDelayTypeResource,
)
from app.api.now_applications.resources.now_application_document_resource import (
    NOWApplicationDocumentIdentityResource,
    NOWApplicationDocumentResource,
    NOWApplicationDocumentSortResource,
    NOWApplicationDocumentUploadResource,
)
from app.api.now_applications.resources.now_application_document_type_resource import (
    NOWApplicationDocumentGenerateResource,
    NOWApplicationDocumentTypeListResource,
    NOWApplicationDocumentTypeResource,
)
from app.api.now_applications.resources.now_application_export_resource import (
    NOWApplicationExportResource,
)
from app.api.now_applications.resources.now_application_import_resource import (
    NOWApplicationImportResource,
)
from app.api.now_applications.resources.now_application_import_submission_documents_job import (
    NOWApplicationImportSubmissionDocumentsJobResource,
)
from app.api.now_applications.resources.now_application_list_proponent_resource import (
    NOWApplicationListProponentResource,
)
from app.api.now_applications.resources.now_application_list_resource import (
    NOWApplicationListResource,
)
from app.api.now_applications.resources.now_application_now_numbers_list_resource import (
    NOWApplicationNOWNumbersListResource,
)
from app.api.now_applications.resources.now_application_permit_type_resource import (
    NOWApplicationPermitTypeResource,
)
from app.api.now_applications.resources.now_application_progress_resource import (
    NOWApplicationProgressResource,
)
from app.api.now_applications.resources.now_application_progress_status_resource import (
    NOWApplicationProgressStatusResource,
)
from app.api.now_applications.resources.now_application_proponent_resource import (
    NOWApplicationProponentResource,
)
from app.api.now_applications.resources.now_application_resource import (
    NOWApplicationResource,
)
from app.api.now_applications.resources.now_application_review_resource import (
    NOWApplicationReviewListResource,
    NOWApplicationReviewResource,
)
from app.api.now_applications.resources.now_application_review_type_resource import (
    NOWApplicationReviewTypeResource,
)
from app.api.now_applications.resources.now_application_status_resource import (
    NOWApplicationStatusCodeResource,
    NOWApplicationStatusResource,
)
from app.api.now_applications.resources.now_application_type_resource import (
    NOWApplicationTypeResource,
)
from app.api.now_applications.resources.underground_exploration_type_resource import (
    UndergroundExplorationTypeResource,
)
from app.api.now_applications.resources.unit_type_resource import UnitTypeResource
from app.api.now_submissions.resources.application_document_resource import (
    ApplicationDocumentResource,
    ApplicationDocumentTokenResource,
)
from app.api.now_submissions.resources.application_list_resource import (
    ApplicationListResource,
)
from app.api.now_submissions.resources.application_nda_list_resource import (
    ApplicationNDAListResource,
)
from app.api.now_submissions.resources.application_nda_resource import (
    ApplicationNDAResource,
)
from app.api.now_submissions.resources.application_resource import ApplicationResource
from app.api.now_submissions.resources.application_start_stop_list_resource import (
    ApplicationStartStopListResource,
)
from app.api.now_submissions.resources.application_status_resource import (
    ApplicationStatusListResource,
    ApplicationStatusResource,
)
from app.api.orgbook.resources.orgbook_resources import (
    CredentialResource,
    VerifyResource,
)
from app.api.parties.party.resources.merge_resource import MergeResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.parties.party.resources.party_orgbook_entity_list_resource import (
    PartyOrgBookEntityListResource,
)
from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.sub_division_code_resource import (
    SubDivisionCodeResource,
)
from app.api.parties.party_appt.resources.mine_party_appt_document_upload_resource import (
    MinePartyApptDocumentUploadResource,
)
from app.api.parties.party_appt.resources.mine_party_appt_resource import (
    MinePartyApptResource,
)
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import (
    MinePartyApptTypeResource,
)
from app.api.projects.ams_final_application.resources.ams_final_application_resource import (
    AmsFinalApplicationDocumentResource,
    AmsFinalApplicationListResource,
    AmsFinalApplicationMineSpaceEditResource,
    AmsFinalApplicationResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table import (
    InformationRequirementsTableResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table_document_types import (
    InformationRequirementsTableDocumentTypeResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table_document_upload import (
    InformationRequirementsTableDocumentUploadResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table_list import (
    InformationRequirementsTableListResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table_status_code import (
    InformationRequirementsTableStatusCodeResource,
)
from app.api.projects.information_requirements_table.resources.information_requirements_table_uploaded_document import (
    InformationRequirementsTableUploadedDocumentResource,
)
from app.api.projects.information_requirements_table.resources.requirements import (
    RequirementsResource,
)
from app.api.projects.information_requirements_table.resources.requirements_list import (
    RequirementsListResource,
)
from app.api.projects.major_mine_application.resources.major_mine_application import (
    MajorMineApplicationResource,
)
from app.api.projects.major_mine_application.resources.major_mine_application_document_upload import (
    MajorMineApplicationDocumentUploadResource,
)
from app.api.projects.major_mine_application.resources.major_mine_application_list import (
    MajorMineApplicationListResource,
)
from app.api.projects.major_mine_application.resources.major_mine_application_uploaded_document import (
    MajorMineApplicationUploadedDocumentResource,
)
from app.api.projects.project.resources.project import (
    ProjectListDashboardResource,
    ProjectListResource,
    ProjectResource,
)
from app.api.projects.project_decision_package.resources.project_decision_package import (
    ProjectDecisionPackageListResource,
    ProjectDecisionPackageResource,
)
from app.api.projects.project_decision_package.resources.project_decision_package_document_upload import (
    ProjectDecisionPackageDocumentUploadResource,
)
from app.api.projects.project_decision_package.resources.project_decision_package_uploaded_document import (
    ProjectDecisionPackageUploadedDocumentResource,
)
from app.api.projects.project_link.resources.project_link_resource import (
    ProjectLinkListResource,
)
from app.api.projects.project_summary.resources.project_summary import (
    ProjectSummaryResource,
)
from app.api.projects.project_summary.resources.project_summary_authorization_statuses import (
    ProjectSummaryAuthorizationStatusesResource,
)
from app.api.projects.project_summary.resources.project_summary_authorization_types import (
    ProjectSummaryAuthorizationTypeResource,
)
from app.api.projects.project_summary.resources.project_summary_document_types import (
    ProjectSummaryDocumentTypeResource,
)
from app.api.projects.project_summary.resources.project_summary_document_upload import (
    ProjectSummaryDocumentUploadResource,
)
from app.api.projects.project_summary.resources.project_summary_list import (
    ProjectSummaryListGetResource,
    ProjectSummaryListPostResource,
)
from app.api.projects.project_summary.resources.project_summary_ministry_comment import (
    ProjectSummaryMinistryCommentResource,
)
from app.api.projects.project_summary.resources.project_summary_permit_types import (
    ProjectSummaryPermitTypeResource,
)
from app.api.projects.project_summary.resources.project_summary_status_codes import (
    ProjectSummaryStatusCodeResource,
)
from app.api.projects.project_summary.resources.project_summary_uploaded_document import (
    ProjectSummaryUploadedDocumentResource,
)
from app.api.regions.resources.region_list_resource import RegionListResource
from app.api.report_error.resources.report_error_resource import ReportErrorResource
from app.api.reporting.resources.metabase import MetabaseDashboardResource
from app.api.search.search.resources.search import SearchOptionsResource, SearchResource
from app.api.search.search.resources.simple_search import SimpleSearchResource
from app.api.securities.resources.bond import (
    BondListResource,
    BondResource,
    BondTransferResource,
)
from app.api.securities.resources.bond_document import BondDocumentListResource
from app.api.securities.resources.bond_status import BondStatusResource
from app.api.securities.resources.bond_type import BondTypeResource
from app.api.securities.resources.reclamation_invoice import (
    ReclamationInvoiceListResource,
    ReclamationInvoiceResource,
)
from app.api.securities.resources.reclamation_invoice_document import (
    ReclamationInvoiceDocumentListResource,
)
from app.api.users.core.resources.core_user import (
    CoreUserListResource,
    CoreUserResource,
)
from app.api.users.minespace.resources.minespace_user import (
    MinespaceUserListResource,
    MinespaceUserResource,
)
from app.api.users.minespace.resources.minespace_user_mine import (
    MinespaceUserMineListResource,
    MinespaceUserMineResource,
)
from app.api.users.resources.user_list_resource import UserListResource
from app.api.users.resources.user_resource import UserResource
from app.api.utils.access_decorators import (
    EDIT_CODE,
    EDIT_DO,
    EDIT_EXPLOSIVES_PERMIT,
    EDIT_HELPDESK,
    EDIT_INCIDENTS,
    EDIT_INFORMATION_REQUIREMENTS_TABLE,
    EDIT_MAJOR_MINE_APPLICATIONS,
    EDIT_MINISTRY_CONTACTS,
    EDIT_PARTY,
    EDIT_PERMIT,
    EDIT_PROJECT_DECISION_PACKAGES,
    EDIT_PROJECT_SUMMARIES,
    EDIT_REPORT,
    EDIT_REQUIREMENTS,
    EDIT_SECURITIES,
    EDIT_STANDARD_PERMIT_CONDITIONS,
    EDIT_SUBMISSIONS,
    EDIT_TSF,
    EDIT_VARIANCE,
    GIS,
    MDS_ADMINISTRATIVE_USERS,
    MINE_ADMIN,
    MINE_EDIT,
    MINESPACE_PROPONENT,
    VIEW_ALL,
)
from app.api.variances.resources.variance_application_status_code import (
    VarianceApplicationStatusCodeResource,
)
from app.api.variances.resources.variance_document_category_code import (
    VarianceDocumentCategoryCodeResource,
)
from app.api.variances.resources.variance_resource import VarianceResource
from app.api.verifiable_credentials.resources.dependency_tests import (
    OrgbookPublisherConnectionResource,
)
from app.api.verifiable_credentials.resources.vc_connection_invitations import (
    VerifiableCredentialConnectionInvitationsResource,
)
from app.api.verifiable_credentials.resources.vc_connections import (
    VerifiableCredentialConnectionResource,
)
from app.api.verifiable_credentials.resources.vc_map import (
    VerifiableCredentialMinesActPermitResource,
)
from app.api.verifiable_credentials.resources.vc_map_detail import (
    VerifiableCredentialCredentialExchangeResource,
)
from app.api.verifiable_credentials.resources.vc_revocation import (
    VerifiableCredentialRevocationResource,
)
from app.api.verifiable_credentials.resources.w3c_map_credential_resource import (
    W3CCredentialIssueResource,
    W3CCredentialResource,
)
from app.api.verify.mine.now.resources.verify_mine_now import VerifyMineNOWResource
from app.api.verify.permit.mine.resources.verify_permit_mine_resource import (
    VerifyPermitMineResource,
)
from app.api.verify.permit.now.resources.verify_permit_now_resource import (
    VerifyPermitNOWResource,
)

EXPECTED_AUTH_TABLE = [
        (ActivityListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (ActivityListResource, "post", [EDIT_DO, MINESPACE_PROPONENT]),
        (ActivityMarkAsReadResource, "patch", [VIEW_ALL, MINESPACE_PROPONENT]),
        (AdministrativeAmendmentListResource, 'post', [EDIT_PERMIT]),
        (AmsFinalApplicationDocumentResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS]),
        (AmsFinalApplicationListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (AmsFinalApplicationMineSpaceEditResource, 'put', [MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS]),
        (AmsFinalApplicationResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS]),
        (AmsFinalApplicationResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS]),
        (ApplicationDocumentTokenResource, 'get', [VIEW_ALL]),
        (ApplicationDocumentResource, 'put', [VIEW_ALL]),
        (ApplicationListResource, 'get', [VIEW_ALL]),
        (ApplicationListResource, 'post', [EDIT_SUBMISSIONS]),
        (ApplicationNDAListResource, 'post', [EDIT_SUBMISSIONS]),
        (ApplicationNDAResource, 'get', [VIEW_ALL]),
        (ApplicationResource, 'get', [VIEW_ALL]),
        (ApplicationStartStopListResource, 'post', [EDIT_SUBMISSIONS]),
        (ApplicationStatusListResource, 'get', [VIEW_ALL]),
        (ApplicationStatusResource, 'get', [VIEW_ALL]),
        (AssignUserToPermitConditionCategory, 'get', [VIEW_ALL]),
        (AssignUserToPermitConditionCategory, 'post', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (AssignUserToPermitConditionCategory, 'put', [VIEW_ALL]),
        (BondDocumentListResource, 'post', [EDIT_SECURITIES]),
        (BondListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (BondListResource, 'post', [EDIT_SECURITIES]),
        (BondResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (BondResource, 'put', [EDIT_SECURITIES]), (BondTransferResource, 'put', [EDIT_SECURITIES]),
        (BondStatusResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (BondTypeResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ComplianceArticleCreateResource, 'post', [EDIT_CODE]),
        (ComplianceArticleResource, "get", [VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE]),
        (ComplianceArticleUpdateResource, 'put', [EDIT_CODE]),
        (ComplianceDocumentTokenResource, 'get', [VIEW_ALL]),
        (CoreUserListResource, 'get', [VIEW_ALL]),
        (CoreUserResource, 'get', [VIEW_ALL]),
        (CoreUserResource, 'put', [MINE_EDIT]),
        (CredentialResource, 'get', [VIEW_ALL]),
        (DamListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (DamListResource, 'post', [EDIT_DO, MINESPACE_PROPONENT]),
        (DamResource, 'get', [EDIT_TSF, MINESPACE_PROPONENT]),
        (DamResource, 'patch', [EDIT_TSF, MINESPACE_PROPONENT]),
        (DocumentUploadStatusResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (DownloadTokenResource, "get", [VIEW_ALL, MINESPACE_PROPONENT, GIS]),
        (EPICResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ExplosivesPermitAmendmentListResource, 'post', [EDIT_EXPLOSIVES_PERMIT]),
        (ExplosivesPermitAmendmentResource, 'delete', [MINE_ADMIN]),
        (ExplosivesPermitAmendmentResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ExplosivesPermitAmendmentResource, 'put', [EDIT_EXPLOSIVES_PERMIT]),
        (ExplosivesPermitDocumentGenerateResource, 'post', [MINE_EDIT]),
        (ExplosivesPermitDocumentTypeListResource, 'get', [VIEW_ALL]),
        (ExplosivesPermitDocumentTypeResource, 'get', [VIEW_ALL]),
        (ExplosivesPermitDocumentUploadResource, 'post', [MINE_EDIT, MINESPACE_PROPONENT, EDIT_EXPLOSIVES_PERMIT, EDIT_PERMIT]),
        (ExplosivesPermitListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ExplosivesPermitListResource, 'post', [EDIT_EXPLOSIVES_PERMIT]),
        (ExplosivesPermitResource, 'delete', [MINE_ADMIN]),
        (ExplosivesPermitResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ExplosivesPermitResource, 'put', [EDIT_EXPLOSIVES_PERMIT]),
        (GlobalMineAlertListResource, 'get', [VIEW_ALL]),
        (HelpListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (HelpResource, 'delete', [EDIT_HELPDESK]),
        (HelpResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (HelpResource, 'post', [EDIT_HELPDESK]),
        (HelpResource, 'put', [EDIT_HELPDESK]),
        (IncidentsResource, 'get', [VIEW_ALL]),
        (InformationRequirementsTableDocumentTypeResource, 'get', [VIEW_ALL]),
        (InformationRequirementsTableListResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (InformationRequirementsTableResource, 'delete', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
        (InformationRequirementsTableResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (InformationRequirementsTableResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
        (InformationRequirementsTableStatusCodeResource, 'get', [VIEW_ALL]),
        (InformationRequirementsTableUploadedDocumentResource, 'delete', [MINE_ADMIN, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
        (InformationRequirementsTableDocumentUploadResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (MajorMineApplicationDocumentUploadResource, 'post', [MINE_EDIT, MINESPACE_PROPONENT]),
        (MajorMineApplicationListResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (MajorMineApplicationResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MajorMineApplicationResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS]),
        (MajorMineApplicationUploadedDocumentResource, 'delete', [MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS]),
        (MergeResource, 'post', [MDS_ADMINISTRATIVE_USERS]),
        (MetabaseDashboardResource, 'get', [VIEW_ALL]),
        (MineAlertListResource, 'get', [VIEW_ALL]),
        (MineAlertListResource, 'post', [VIEW_ALL]),
        (MineAlertResource, 'delete', [MINE_ADMIN]),
        (MineAlertResource, 'get', [VIEW_ALL]),
        (MineAlertResource, 'put', [MINE_EDIT]),
        (MineBasicInfoResource, 'post', [VIEW_ALL]),
        (MineCommentListResource, 'get', [VIEW_ALL]), (MineCommentListResource, 'post', [VIEW_ALL]),
        (MineCommentResource, 'delete', [MINE_ADMIN]),
        (MineCommodityCodeResource, "get", [VIEW_ALL]),
        (MineComplianceSummaryResource, "get", [VIEW_ALL]),
        (MineDisturbanceCodeResource, "get", [VIEW_ALL]),
        (MineDocumentArchiveResource, 'patch', [MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS, MINESPACE_PROPONENT]),
        (MineDocumentBundleResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineDocumentListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineDocumentListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineDocumentVersionListResource, "post", [MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
        (MineDocumentVersionUploadResource, "post", [MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
        (MineIncidentCategoryResource, 'get', [VIEW_ALL]),
        (MineIncidentDeterminationTypeResource, 'get', [VIEW_ALL]),
        (MineIncidentDocumentListResource, 'post', [EDIT_DO, MINESPACE_PROPONENT]),
        (MineIncidentDocumentResource, 'delete', [EDIT_DO, MINESPACE_PROPONENT]),
        (MineIncidentDocumentResource, 'put', [EDIT_DO, MINESPACE_PROPONENT]),
        (MineIncidentDocumentTypeCodeResource, 'get', [VIEW_ALL]),
        (MineIncidentFollowupTypeResource, 'get', [VIEW_ALL]),
        (MineIncidentListResource, 'get', [VIEW_ALL]),
        (MineIncidentListResource, 'post', [EDIT_DO, MINESPACE_PROPONENT]),
        (MineIncidentNoteListResource, 'get', [VIEW_ALL]),
        (MineIncidentNoteListResource, 'post', [MINE_ADMIN, EDIT_INCIDENTS]),
        (MineIncidentNoteResource, 'delete', [MINE_ADMIN, EDIT_INCIDENTS]),
        (MineIncidentNoteResource, 'get', [VIEW_ALL]),
        (MineIncidentResource, 'delete', [MINE_ADMIN]),
        (MineIncidentResource, 'get', [VIEW_ALL]),
        (MineIncidentResource, 'put', [EDIT_DO, MINESPACE_PROPONENT]),
        (MineIncidentStatusCodeResource, 'get', [VIEW_ALL]),
        (MineListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineListResource, "post", [MINE_EDIT]),
        (MineListSearch, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineMapResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineNoticeOfDepartureDocumentResource, 'delete', [EDIT_PERMIT]),
        (MineNoticeOfDepartureDocumentUploadResource, 'put', [EDIT_PERMIT, MINESPACE_PROPONENT]),
        (MineNoticeOfDepartureNewDocumentUploadResource, 'post', [EDIT_PERMIT, MINESPACE_PROPONENT]),
        (MinePartyApptDocumentUploadResource, 'post', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (MinePartyApptDocumentUploadResource, 'put', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (MinePartyApptResource, "get", [VIEW_ALL]), (MinePartyApptResource, "post", [MINE_EDIT, MINESPACE_PROPONENT]),
        (MinePartyApptResource, "put", [MINE_EDIT, MINESPACE_PROPONENT]), (MinePartyApptResource, "delete", [MINE_EDIT]),
        (MinePartyApptTypeResource, "get", [VIEW_ALL]), (MineRegionResource, "get", [VIEW_ALL]),
        (MineReportCategoryListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportCommentListResource, 'get', [VIEW_ALL]),
        (MineReportCommentListResource, 'post', [EDIT_REPORT]),
        (MineReportCommentResource, 'delete', [MINE_ADMIN]),
        (MineReportCommentResource, 'put', [EDIT_REPORT]),
        (MineReportDefinitionComplianceArticleCreateResource, 'post', [EDIT_CODE]),
        (MineReportDefinitionComplianceArticleUpdateResource, 'put', [EDIT_CODE]),
        (MineReportDefinitionListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportDefinitionListResource, 'post', [EDIT_CODE]),
        (MineReportDefinitionResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportDocumentListResource, 'post', [EDIT_REPORT, MINESPACE_PROPONENT]),
        (MineReportDueDateTypeResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportListResource, "post", [EDIT_REPORT, MINESPACE_PROPONENT]),
        (MineReportPermitRequirementResource, 'delete', [EDIT_REPORT]),
        (MineReportPermitRequirementResource, 'put', [EDIT_REPORT]),
        (MineReportPermitRequirementResource, "post", [EDIT_REPORT]),
        (MineReportResource, 'delete', [EDIT_REPORT]),
        (MineReportResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineReportResource, "put", [EDIT_REPORT, MINESPACE_PROPONENT]),
        (MineReportSubmissionStatusResource, 'get', [VIEW_ALL]),
        (MineResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineResource, "put", [MINE_EDIT, MINESPACE_PROPONENT]),
        (MinespaceUserListResource, 'post', [MINE_ADMIN]),
        (MinespaceUserMineListResource, 'post', [MINE_ADMIN]),
        (MinespaceUserMineResource, 'delete', [MINE_ADMIN]),
        (MinespaceUserResource, 'get', [MINE_ADMIN]), (MinespaceUserResource, 'delete', [MINE_ADMIN]),
        (MinespaceUserResource, 'put', [MINE_ADMIN]),
        (MineStatusXrefListResource, "get", [VIEW_ALL]),
        (MineSubscriptionListResource, 'get', [VIEW_ALL]),
        (MineSubscriptionResource, 'delete', [VIEW_ALL]),
        (MineSubscriptionResource, 'post', [VIEW_ALL]),
        (MineSummaryCSVResource, 'get', [VIEW_ALL]),
        (MineSummaryResource, 'get', [VIEW_ALL]),
        (MineTailingsStorageFacilityListResource, "get", [VIEW_ALL]),
        (MineTailingsStorageFacilityListResource, "post", [MINESPACE_PROPONENT, EDIT_TSF]),
        (MineTailingsStorageFacilityResource, "get", [EDIT_TSF, MINESPACE_PROPONENT, VIEW_ALL]),
        (MineTailingsStorageFacilityResource, "put", [EDIT_TSF, MINESPACE_PROPONENT]),
        (MineTenureTypeCodeResource, "get", [VIEW_ALL]), (MineTypeListResource, "post", [MINE_EDIT]),
        (MineTypeResource, "delete", [MINE_EDIT]),
        (MineVarianceDocumentUploadResource, "post", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (MineVarianceDocumentUploadResource, "put", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (MineVarianceListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineVarianceListResource, "post", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (MineVarianceResource, 'delete', [MINE_ADMIN]),
        (MineVarianceResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineVarianceResource, "put", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (MineVarianceUploadedDocumentsResource, "delete", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (MineVerifiedStatusListResource, 'get', [VIEW_ALL]),
        (MineVerifiedStatusResource, 'put', [MINE_EDIT]),
        (MineWorkInformationListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineWorkInformationListResource, 'post', [MINE_EDIT, MINESPACE_PROPONENT]),
        (MineWorkInformationResource, 'delete', [MINE_EDIT]),
        (MineWorkInformationResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MineWorkInformationResource, 'put', [MINE_EDIT, MINESPACE_PROPONENT]),
        (MinistryContactListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MinistryContactListResource, 'post', [EDIT_MINISTRY_CONTACTS]),
        (MinistryContactResource, 'delete', [MINE_ADMIN]),
        (MinistryContactResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (MinistryContactResource, 'put', [EDIT_MINISTRY_CONTACTS]),
        (NoticeOfDepartureListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (NoticeOfDepartureListResource, 'post', [EDIT_DO, MINESPACE_PROPONENT]),
        (NoticeOfDepartureResource, 'delete', [EDIT_PERMIT, MINESPACE_PROPONENT]),
        (NoticeOfDepartureResource, 'get', [EDIT_PERMIT, VIEW_ALL, MINESPACE_PROPONENT]),
        (NoticeOfDepartureResource, 'patch', [EDIT_PERMIT, MINESPACE_PROPONENT]),
        (NOWActivityTypeResource, 'get', [VIEW_ALL]),
        (NOWApplicationDelayListResource, 'get', [VIEW_ALL]),
        (NOWApplicationDelayListResource, 'post', [VIEW_ALL]),
        (NOWApplicationDelayResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationDelayTypeResource, 'get', [VIEW_ALL]),
        (NOWApplicationDocumentGenerateResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationDocumentIdentityResource, "post", [EDIT_PERMIT]),
        (NOWApplicationDocumentResource, 'delete', [EDIT_PERMIT]),
        (NOWApplicationDocumentResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationDocumentSortResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationDocumentTypeListResource, 'get', [VIEW_ALL]),
        (NOWApplicationDocumentTypeResource, 'get', [VIEW_ALL]),
        (NOWApplicationDocumentUploadResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationExportResource, 'post', [EDIT_PERMIT]),
        (NowApplicationGisExportResource, 'get', [VIEW_ALL, GIS]),
        (NOWApplicationImportResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationImportSubmissionDocumentsJobResource, 'post', [MINE_ADMIN]),
        (NOWApplicationListProponentResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (NOWApplicationListResource, 'get', [VIEW_ALL, GIS]),
        (NOWApplicationListResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationNOWNumbersListResource, 'post', [VIEW_ALL, GIS]),
        (NOWApplicationPermitTypeResource, 'get', [VIEW_ALL]),
        (NOWApplicationProgressResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationProgressResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationProgressStatusResource, 'get', [VIEW_ALL]),
        (NOWApplicationProponentResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (NOWApplicationResource, 'get', [VIEW_ALL, GIS]),
        (NOWApplicationResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationReviewListResource, 'get', [VIEW_ALL]),
        (NOWApplicationReviewListResource, 'post', [EDIT_PERMIT]),
        (NOWApplicationReviewResource, 'delete', [EDIT_PERMIT]),
        (NOWApplicationReviewResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationReviewTypeResource, 'get', [VIEW_ALL]),
        (NOWApplicationStatusCodeResource, 'get', [VIEW_ALL]),
        (NOWApplicationStatusResource, 'put', [EDIT_PERMIT]),
        (NOWApplicationTypeResource, 'get', [VIEW_ALL]),
        (OrgbookPublisherConnectionResource, 'post', [VIEW_ALL]),
        (PartyListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (PartyListResource, "post", [EDIT_PARTY, MINESPACE_PROPONENT]), (PartyResource, "get", [VIEW_ALL]),
        (PartyOrgBookEntityListResource, 'delete', [MINE_ADMIN]),
        (PartyOrgBookEntityListResource, 'post', [EDIT_PARTY]),
        (PartyResource, "put", [EDIT_PARTY, MINESPACE_PROPONENT]), (PartyResource, "delete", [MINE_ADMIN]),
        (PermitAmendmentConditionCategoryListResource, 'get', [VIEW_ALL]),
        (PermitAmendmentConditionCategoryListResource, 'post', [VIEW_ALL]),
        (PermitAmendmentConditionCategoryResource, 'delete', [VIEW_ALL]),
        (PermitAmendmentConditionCategoryResource, 'put', [VIEW_ALL]),
        (PermitAmendmentDiffResource, 'get', [VIEW_ALL]),
        (PermitAmendmentDocumentListResource, "put", [EDIT_PERMIT]),
        (PermitAmendmentDocumentResource, "delete", [EDIT_PERMIT]),
        (PermitAmendmentListResource, "post", [EDIT_PERMIT]),
        (PermitAmendmentResource, 'get', [VIEW_ALL]),
        (PermitAmendmentResource, "delete", [EDIT_PERMIT]),
        (PermitAmendmentResource, "put", [EDIT_PERMIT]),
        (PermitAmendmentVCResource, 'post', [MINE_ADMIN]),
        (PermitConditionCategoryResource, 'get', [VIEW_ALL]),
        (PermitConditionExtractionProgressResource, 'get', [VIEW_ALL]),
        (PermitConditionExtractionResource, 'delete', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (PermitConditionExtractionResource, 'get', [VIEW_ALL]),
        (PermitConditionExtractionResource, 'post', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (PermitConditionsListResource, 'get', [EDIT_PERMIT]),
        (PermitConditionsListResource, 'post', [EDIT_PERMIT]),
        (PermitConditionsResource, 'delete', [EDIT_PERMIT]),
        (PermitConditionsResource, 'get', [EDIT_PERMIT]),
        (PermitConditionsResource, 'put', [EDIT_PERMIT]),
        (PermitConditionsSearchResource, 'post', [VIEW_ALL]),
        (PermitConditionTagResource, 'delete', [MINE_ADMIN]),
        (PermitConditionTagResource, 'get', [VIEW_ALL]),
        (PermitConditionTagResource, 'post', [MINE_ADMIN]),
        (PermitConditionTagResource, 'put', [MINE_ADMIN]),
        (PermitConditionTemplateResource, 'post', [EDIT_PERMIT]),
        (PermitConditionTypeResource, 'get', [VIEW_ALL]),
        (PermitDocumentUploadInitializationResource, "post", [EDIT_PERMIT]),
        (PermitListResource, 'get', [VIEW_ALL]),
        (PermitResource, 'delete', [MINE_ADMIN]),
        (PermitResource, 'patch', [EDIT_PERMIT]),
        (PermitResource, "get", [VIEW_ALL]), (PermitListResource, "post", [EDIT_PERMIT]),
        (PermitResource, "put", [EDIT_SECURITIES]),
        (PermitStatusCodeResource, 'get', [VIEW_ALL]),
        (ProjectDecisionPackageDocumentUploadResource, 'post', [MINE_EDIT, EDIT_PROJECT_DECISION_PACKAGES]),
        (ProjectDecisionPackageListResource, 'post', [MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES]),
        (ProjectDecisionPackageResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectDecisionPackageResource, 'put', [MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES]),
        (ProjectDecisionPackageUploadedDocumentResource, 'delete', [MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES]),
        (ProjectLinkListResource, 'delete', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (ProjectLinkListResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (ProjectListDashboardResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectResource, 'put', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectSummaryAuthorizationStatusesResource, 'post', [VIEW_ALL]),
        (ProjectSummaryAuthorizationTypeResource, 'get', [VIEW_ALL]),
        (ProjectSummaryDocumentTypeResource, 'get', [VIEW_ALL]),
        (ProjectSummaryDocumentUploadResource, 'post', [MINE_EDIT, MINESPACE_PROPONENT]),
        (ProjectSummaryListGetResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectSummaryListPostResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
        (ProjectSummaryMinistryCommentResource, 'get', [VIEW_ALL]),
        (ProjectSummaryMinistryCommentResource, 'post', [EDIT_PROJECT_SUMMARIES]),
        (ProjectSummaryPermitTypeResource, 'get', [VIEW_ALL]),
        (ProjectSummaryResource, 'delete', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES]),
        (ProjectSummaryResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ProjectSummaryResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES]),
        (ProjectSummaryStatusCodeResource, 'get', [VIEW_ALL]),
        (ProjectSummaryUploadedDocumentResource, 'delete', [MINE_ADMIN, EDIT_PROJECT_SUMMARIES, MINESPACE_PROPONENT]),
        (ReclamationInvoiceDocumentListResource, 'post', [EDIT_SECURITIES]),
        (ReclamationInvoiceListResource, 'get', [VIEW_ALL]),
        (ReclamationInvoiceListResource, 'post', [EDIT_SECURITIES]),
        (ReclamationInvoiceResource, 'get', [VIEW_ALL]),
        (ReclamationInvoiceResource, 'put', [EDIT_SECURITIES]),
        (RegionListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ReportErrorResource, 'post', [VIEW_ALL]),
        (ReportsResource, 'get', [VIEW_ALL]),
        (ReportSubmissionResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ReportSubmissionResource, 'post', [EDIT_REPORT, MINESPACE_PROPONENT]),
        (RequirementsListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (RequirementsListResource, 'post', [EDIT_REQUIREMENTS]),
        (RequirementsResource, 'delete', [MINESPACE_PROPONENT, EDIT_REQUIREMENTS]),
        (RequirementsResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (RequirementsResource, 'put', [MINESPACE_PROPONENT, EDIT_REQUIREMENTS]),
        (SearchResource, "get", [VIEW_ALL]), (SearchOptionsResource, "get", [VIEW_ALL]),
        (SimpleSearchResource, "get", [VIEW_ALL]), (MinespaceUserListResource, 'get', [MINE_ADMIN]),
        (StandardPermitConditionsListResource, 'get', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardPermitConditionsListResource, 'post', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardPermitConditionsResource, 'delete', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardPermitConditionsResource, 'put', [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardReportPermitRequirementResource, "delete", [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardReportPermitRequirementResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
        (StandardReportPermitRequirementResource, "post", [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StandardReportPermitRequirementResource, "put", [EDIT_STANDARD_PERMIT_CONDITIONS]),
        (StaticContentResource, 'get', [VIEW_ALL]),
        (SubDivisionCodeResource, 'get', [VIEW_ALL]),
        (UndergroundExplorationTypeResource, 'get', [VIEW_ALL]),
        (UnitTypeResource, 'get', [VIEW_ALL]),
        (UserListResource, 'get', [VIEW_ALL]),
        (UserResource, 'get', [VIEW_ALL]),
        (VarianceApplicationStatusCodeResource, 'get', [VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT]),
        (VarianceDocumentCategoryCodeResource, 'get', [VIEW_ALL]),
        (VarianceResource, 'get', [VIEW_ALL]),
        (VerifiableCredentialConnectionInvitationsResource, 'delete', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialConnectionInvitationsResource, 'get', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialConnectionInvitationsResource, 'post', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialConnectionResource, 'delete', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialCredentialExchangeResource, 'get', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialMinesActPermitResource, 'get', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialMinesActPermitResource, 'post', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (VerifiableCredentialRevocationResource, 'post', [EDIT_PARTY]),
        (VerifyMineNOWResource, 'get', [VIEW_ALL]),
        (VerifyPermitMineResource, 'get', [VIEW_ALL]),
        (VerifyPermitNOWResource, 'get', [VIEW_ALL]),
        (VerifyResource, 'get', [VIEW_ALL]),
        (W3CCredentialResource, 'get', [VIEW_ALL]),
        (W3CCredentialIssueResource, 'post', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (W3CCredentialIssueResource, 'get', [EDIT_PARTY, MINESPACE_PROPONENT]),
        (ZipProgressResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
        (ZipResource, 'post', [VIEW_ALL, MINESPACE_PROPONENT]),
    ]

# Ignore test-only resource classes defined within test modules so they don't
# trigger failures in the auth coverage test. If new dummy resources are added
# in tests, append their class names here.
IGNORED_RESOURCE_CLASSES = {"DummyAuthResource", "DummyResource"}

# If there are endpoints that are intentionally left without an access decorator (i.e. they
# should be publicly accessible and have no role restrictions), add them here as tuples of
# (ClassName, http_method). This should normally remain empty; entries should include a
# code comment in the resource explaining why they are exempt.
ALLOWED_UNPROTECTED = {
    ("Healthcheck", "get"),
    ("Livenesscheck", "get"),
    ("Readinesscheck", "get"),
    ("VersionCheck", "get"),
    ("SwaggerView", "get"),  # Flask-RESTX swagger UI
}


@pytest.mark.parametrize("resource,method,expected_roles", EXPECTED_AUTH_TABLE)
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint is not None, f"{resource} does not have a {method.upper()} method."
    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(assigned_roles), (
        f"For the {resource.__name__} {method.upper()} method, expected the authorization flags {expected_roles}, "
        f"but had {assigned_roles} instead."
    )


def test_all_protected_resource_methods_are_listed(app):
    """Validate every protected Resource method appears in EXPECTED_AUTH_TABLE.

    A protected method is any method (get/post/put/delete/patch) on a flask-restx Resource
    subclass that has a 'required_roles' attribute (added by an access decorator) AND is
    not purely a public endpoint (i.e., decorated only with @public_endpoint).
    """
    http_verbs = {"get", "post", "put", "delete", "patch"}
    protected_methods = set()
    roles_by_method = {}
    class_obj_by_name = {}
    for endpoint, view_func in app.view_functions.items():
        view_class = getattr(view_func, 'view_class', None)
        if not view_class:
            continue
        if view_class.__name__ in IGNORED_RESOURCE_CLASSES:
            continue
        class_obj_by_name[view_class.__name__] = view_class
        for method in http_verbs:
            func = getattr(view_class, method, None)
            if func is not None:
                required = getattr(func, 'required_roles', None)
                if required:
                    # If the only role flag is 'public', treat it as unprotected for coverage purposes.
                    deduped = list(dict.fromkeys(required))
                    if set(deduped) == {"public"}:
                        continue
                    key = (view_class.__name__, method)
                    protected_methods.add(key)
                    roles_by_method[key] = deduped

    expected_methods = set((cls.__name__, method) for cls, method, _ in EXPECTED_AUTH_TABLE)
    missing = protected_methods - expected_methods
    if missing:
        suggestion_lines = []
        for cls, method in sorted(missing):
            roles = roles_by_method.get((cls, method), [])
            suggestion_lines.append(
                f"    ({cls}, '{method}', {roles}),  # auto-suggest"
            )
        suggestion_block = "\nSuggested lines (ensure imports exist):\n[\n" + "\n".join(suggestion_lines) + "\n]\n"
        formatted = ', '.join(f"{cls}.{method}" for cls, method in sorted(missing))
        pytest.fail(
            f"Missing expected_auth entries for protected endpoints: {formatted}{suggestion_block}"
        )


def test_all_resource_methods_have_access_decorator(app):
    """Verify that every HTTP method on every Resource has an access decorator.

    This enforces a security baseline that no endpoint is accidentally exposed without an
    authorization requirement. If a method is truly intended to be public, explicitly add
    (ClassName, method) to ALLOWED_UNPROTECTED with supporting rationale in code review.
    """
    http_verbs = {"get", "post", "put", "delete", "patch"}
    missing = []
    for endpoint, view_func in app.view_functions.items():
        view_class = getattr(view_func, 'view_class', None)
        if not view_class:
            # function based or swagger/static endpoints – skip
            continue
        if view_class.__name__ in IGNORED_RESOURCE_CLASSES:
            continue
        for method in http_verbs:
            func = getattr(view_class, method, None)
            if func is None:
                continue
            if (view_class.__name__, method) in ALLOWED_UNPROTECTED:
                continue
            if not getattr(func, 'required_roles', None):
                missing.append(f"{view_class.__name__}.{method}")

    if missing:
        formatted = "\n".join(f"  - {m}" for m in sorted(missing))
        pytest.fail(
            "The following endpoint methods are missing access decorators (required_roles).\n"
            "Add an appropriate @requires_* OR @public_endpoint decorator (preferred), or explicitly allow by adding to ALLOWED_UNPROTECTED if truly intentional:\n"
            f"{formatted}"
        )
