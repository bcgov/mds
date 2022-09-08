import pytest
from app.api.utils.access_decorators import VIEW_ALL, MINE_EDIT, MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PARTY, EDIT_PERMIT, EDIT_STANDARD_PERMIT_CONDITIONS, EDIT_DO, EDIT_VARIANCE, EDIT_REPORT, EDIT_SUBMISSIONS, EDIT_SECURITIES, GIS, EDIT_PROJECT_SUMMARIES, EDIT_INCIDENTS, EDIT_TSF, EDIT_INFORMATION_REQUIREMENTS_TABLE, EDIT_REQUIREMENTS, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES

from app.api.download_token.resources.download_token import DownloadTokenResource
from app.api.mines.documents.resources.mine_document_resource import MineDocumentListResource
from app.api.mines.compliance.resources.compliance import MineComplianceSummaryResource
from app.api.compliance.resources.compliance_article import ComplianceArticleResource
from app.api.mines.mine.resources.mine_commodity_code import MineCommodityCodeResource
from app.api.mines.mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from app.api.mines.mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from app.api.mines.mine.resources.mine_type import MineTypeResource, MineTypeListResource
from app.api.mines.mine.resources.mine import MineResource, MineListSearch, MineListResource
from app.api.mines.mine.resources.mine_map import MineMapResource
from app.api.mines.variances.resources.variance import MineVarianceResource
from app.api.mines.variances.resources.variance_list import MineVarianceListResource
from app.api.mines.variances.resources.variance_document_upload import MineVarianceDocumentUploadResource
from app.api.mines.variances.resources.variance_uploaded_documents import MineVarianceUploadedDocumentsResource
from app.api.incidents.resources.mine_incident_notes import MineIncidentNoteResource, MineIncidentNoteListResource
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.status.resources.status import MineStatusXrefListResource
from app.api.mines.tailings.resources.tailings_list import MineTailingsStorageFacilityListResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityResource
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource
from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.mines.permits.permit.resources.permit import PermitResource, PermitListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentResource, PermitAmendmentDocumentListResource
from app.api.mines.permits.permit.resources.permit_document_upload import PermitDocumentUploadInitializationResource
from app.api.users.minespace.resources.minespace_user import MinespaceUserResource, MinespaceUserListResource
from app.api.users.minespace.resources.minespace_user_mine import MinespaceUserMineResource, MinespaceUserMineListResource
from app.api.search.search.resources.search import SearchResource, SearchOptionsResource
from app.api.search.search.resources.simple_search import SimpleSearchResource
from app.api.mines.reports.resources.mine_reports import MineReportResource, MineReportListResource
from app.api.now_submissions.resources.application_list_resource import ApplicationListResource
from app.api.now_submissions.resources.application_nda_list_resource import ApplicationNDAListResource
from app.api.securities.resources.bond import BondResource, BondListResource, BondTransferResource
from app.api.mines.comments.resources.mine_comment import MineCommentResource, MineCommentListResource
from app.api.mines.permits.permit_conditions.resources.permit_conditions_resource import PermitConditionsListResource, PermitConditionsResource
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_resource import StandardPermitConditionsResource
from app.api.mines.permits.permit_conditions.resources.standard_permit_conditions_list_resource import StandardPermitConditionsListResource
from app.api.now_applications.resources.now_activity_type_resource import NOWActivityTypeResource
from app.api.now_applications.resources.now_application_import_resource import NOWApplicationImportResource
from app.api.now_applications.resources.now_application_document_type_resource import NOWApplicationDocumentTypeListResource, NOWApplicationDocumentTypeResource, NOWApplicationDocumentGenerateResource
from app.api.now_applications.resources.now_application_document_resource import NOWApplicationDocumentUploadResource, NOWApplicationDocumentResource
from app.api.now_applications.resources.now_application_list_resource import NOWApplicationListResource
from app.api.now_applications.resources.now_application_resource import NOWApplicationResource
from app.api.projects.project_summary.resources.project_summary_list import ProjectSummaryListGetResource, ProjectSummaryListPostResource
from app.api.projects.project_summary.resources.project_summary import ProjectSummaryResource
from app.api.projects.information_requirements_table.resources.information_requirements_table import InformationRequirementsTableResource
from app.api.projects.information_requirements_table.resources.requirements import RequirementsResource
from app.api.projects.major_mine_application.resources.major_mine_application import MajorMineApplicationResource
from app.api.projects.project_decision_package.resources.project_decision_package import ProjectDecisionPackageResource, ProjectDecisionPackageListResource


@pytest.mark.parametrize(
    "resource,method,expected_roles",
    [(ComplianceArticleResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (DownloadTokenResource, "get", [VIEW_ALL, MINESPACE_PROPONENT, GIS]),
     (MineCommodityCodeResource, "get", [VIEW_ALL]),
     (MineComplianceSummaryResource, "get", [VIEW_ALL]),
     (MineDisturbanceCodeResource, "get", [VIEW_ALL]),
     (MineDocumentListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineListResource, "post", [MINE_EDIT]),
     (MineListSearch, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineMapResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MinePartyApptResource, "get", [VIEW_ALL]), (MinePartyApptResource, "post", [MINE_EDIT, MINESPACE_PROPONENT]),
     (MinePartyApptResource, "put", [MINE_EDIT]), (MinePartyApptResource, "delete", [MINE_EDIT]),
     (MinePartyApptTypeResource, "get", [VIEW_ALL]), (MineRegionResource, "get", [VIEW_ALL]),
     (MineResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineResource, "put", [MINE_EDIT, MINESPACE_PROPONENT]),
     (MineReportResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineReportResource, "put", [EDIT_REPORT, MINESPACE_PROPONENT]),
     (MineReportListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineReportListResource, "post", [EDIT_REPORT, MINESPACE_PROPONENT]),
     (MineStatusXrefListResource, "get", [VIEW_ALL]),
     (MineTailingsStorageFacilityListResource, "get", [VIEW_ALL]),
     (MineTailingsStorageFacilityListResource, "post", [MINESPACE_PROPONENT, MINE_EDIT]),
     (MineTailingsStorageFacilityResource, "put", [EDIT_TSF, MINESPACE_PROPONENT]),
     (MineTenureTypeCodeResource, "get", [VIEW_ALL]), (MineTypeListResource, "post", [MINE_EDIT]),
     (MineTypeResource, "delete", [MINE_EDIT]),
     (MineVarianceDocumentUploadResource, "post", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
     (MineVarianceDocumentUploadResource, "put", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
     (MineVarianceUploadedDocumentsResource, "delete", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
     (MineVarianceListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineVarianceListResource, "post", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
     (MineVarianceResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineVarianceResource, "put", [EDIT_VARIANCE, MINESPACE_PROPONENT]),
     (PartyListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (PartyListResource, "post", [EDIT_PARTY]), (PartyResource, "get", [VIEW_ALL]),
     (PartyResource, "put", [EDIT_PARTY]), (PartyResource, "delete", [MINE_ADMIN]),
     (PermitResource, "get", [VIEW_ALL]), (PermitListResource, "post", [EDIT_PERMIT]),
     (PermitResource, "put", [EDIT_SECURITIES]),
     (PermitAmendmentListResource, "post", [EDIT_PERMIT]),
     (PermitAmendmentResource, "put", [EDIT_PERMIT]),
     (PermitAmendmentResource, "delete", [EDIT_PERMIT]),
     (PermitDocumentUploadInitializationResource, "post", [EDIT_PERMIT]),
     (PermitAmendmentDocumentListResource, "put", [EDIT_PERMIT]),
     (PermitAmendmentDocumentResource, "delete", [EDIT_PERMIT]),
     (SearchResource, "get", [VIEW_ALL]), (SearchOptionsResource, "get", [VIEW_ALL]),
     (SimpleSearchResource, "get", [VIEW_ALL]), (MinespaceUserListResource, 'get', [MINE_ADMIN]),
     (MinespaceUserListResource, 'post', [MINE_ADMIN]),
     (MinespaceUserResource, 'get', [MINE_ADMIN]), (MinespaceUserResource, 'delete', [MINE_ADMIN]),
     (MinespaceUserMineListResource, 'post', [MINE_ADMIN]),
     (MinespaceUserMineResource, 'delete', [MINE_ADMIN]),
     (NOWActivityTypeResource, 'get', [VIEW_ALL]),
     (NOWApplicationImportResource, 'post', [EDIT_PERMIT]),
     (NOWApplicationListResource, 'get', [VIEW_ALL, GIS]),
     (NOWApplicationListResource, 'post', [EDIT_PERMIT]),
     (NOWApplicationResource, 'get', [VIEW_ALL, GIS]),
     (NOWApplicationResource, 'put', [EDIT_PERMIT]),
     (NOWApplicationDocumentUploadResource, 'post', [EDIT_PERMIT]),
     (NOWApplicationDocumentResource, 'delete', [EDIT_PERMIT]),
     (NOWApplicationDocumentTypeResource, 'get', [VIEW_ALL]),
     (NOWApplicationDocumentTypeListResource, 'get', [VIEW_ALL]),
     (NOWApplicationDocumentGenerateResource, 'post', [EDIT_PERMIT]),
     (ApplicationListResource, 'post', [EDIT_SUBMISSIONS]),
     (ApplicationNDAListResource, 'post', [EDIT_SUBMISSIONS]),
     (BondListResource, 'post', [EDIT_SECURITIES]),
     (BondListResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (BondResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (BondResource, 'put', [EDIT_SECURITIES]), (BondTransferResource, 'put', [EDIT_SECURITIES]),
     (MineCommentListResource, 'get', [VIEW_ALL]), (MineCommentListResource, 'post', [VIEW_ALL]),
     (MineCommentResource, 'delete', [MINE_ADMIN]),
     (PermitConditionsListResource, 'post', [EDIT_PERMIT]),
     (PermitConditionsListResource, 'get', [EDIT_PERMIT]),
     (PermitConditionsResource, 'get', [EDIT_PERMIT]),
     (PermitConditionsResource, 'put', [EDIT_PERMIT]),
     (PermitConditionsResource, 'delete', [EDIT_PERMIT]),
     (StandardPermitConditionsListResource, 'post', [EDIT_STANDARD_PERMIT_CONDITIONS]),
     (StandardPermitConditionsListResource, 'get', [EDIT_STANDARD_PERMIT_CONDITIONS]),
     (StandardPermitConditionsResource, 'put', [EDIT_STANDARD_PERMIT_CONDITIONS]),
     (StandardPermitConditionsResource, 'delete', [EDIT_STANDARD_PERMIT_CONDITIONS]),
     (ProjectSummaryListGetResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (ProjectSummaryListPostResource, 'post', [MINE_ADMIN, MINESPACE_PROPONENT]),
     (ProjectSummaryResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (ProjectSummaryResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES]),
     (ProjectSummaryResource, 'delete', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES]),
     (MineIncidentNoteListResource, 'get', [VIEW_ALL]),
     (MineIncidentNoteListResource, 'post', [MINE_ADMIN, EDIT_INCIDENTS]),
     (MineIncidentNoteResource, 'get', [VIEW_ALL]),
     (MineIncidentNoteResource, 'delete', [MINE_ADMIN, EDIT_INCIDENTS]),
     (InformationRequirementsTableResource, 'put',
      [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
     (InformationRequirementsTableResource, 'delete',
      [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE]),
     (RequirementsResource, 'put', [MINESPACE_PROPONENT, EDIT_REQUIREMENTS]),
     (RequirementsResource, 'delete', [MINESPACE_PROPONENT, EDIT_REQUIREMENTS]),
     (MajorMineApplicationResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (MajorMineApplicationResource, 'put', [MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS]),
     (ProjectDecisionPackageResource, 'get', [VIEW_ALL, MINESPACE_PROPONENT]),
     (ProjectDecisionPackageResource, 'put', [MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES]),
     (ProjectDecisionPackageListResource, 'post', [MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES])])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
