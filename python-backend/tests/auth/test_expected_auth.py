import pytest
from app.api.utils.access_decorators import VIEW_ALL, MINE_CREATE, MINE_ADMIN, MINESPACE_PROPONENT

from app.api.document_manager.resources.document_manager import DocumentManagerResource
from app.api.document_manager.resources.download_token import DownloadTokenResource
from app.api.documents.expected.resources.document_status import ExpectedDocumentStatusResource
from app.api.documents.expected.resources.documents import ExpectedDocumentResource
from app.api.documents.expected.resources.expected_document_uploads import ExpectedDocumentUploadResource
from app.api.documents.expected.resources.mine_documents import ExpectedMineDocumentResource
from app.api.documents.mines.resources.mine_document_resource import MineDocumentResource
from app.api.documents.required.resources.required_documents import RequiredDocumentResource
from app.api.mines.compliance.resources.compliance import MineComplianceSummaryResource
from app.api.mines.compliance.resources.compliance_article import ComplianceArticleResource
from app.api.mines.mine.resources.mine_commodity_code import MineCommodityCodeResource
from app.api.mines.mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from app.api.mines.mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from app.api.mines.mine.resources.mine_type_detail import MineTypeDetailResource
from app.api.mines.mine.resources.mine_type import MineTypeResource, MineTypeListResource
from app.api.mines.mine.resources.mine import MineResource, MineListSearch, MineListResource
from app.api.mines.mine.resources.mine_map import MineMapResource
from app.api.mines.variances.resources.variance import MineVarianceResource
from app.api.mines.variances.resources.variance_list import MineVarianceListResource
from app.api.mines.variances.resources.variance_document_upload import MineVarianceDocumentUploadResource
from app.api.mines.variances.resources.variance_uploaded_documents import MineVarianceUploadedDocumentsResource
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.status.resources.status import MineStatusResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityListResource
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource
from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.mines.permits.permit.resources.permit import PermitResource, PermitListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment import PermitAmendmentResource, PermitAmendmentListResource
from app.api.mines.permits.permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentResource, PermitAmendmentDocumentListResource
from app.api.users.minespace.resources.minespace_user import MinespaceUserResource
from app.api.users.minespace.resources.minespace_user_mine import MinespaceUserMineResource
from app.api.search.search.resources.search import SearchResource, SearchOptionsResource
from app.api.search.search.resources.simple_search import SimpleSearchResource


@pytest.mark.parametrize(
    "resource,method,expected_roles",
    [(ComplianceArticleResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "get", []),
     (DocumentManagerResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "patch", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "head", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DownloadTokenResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (ExpectedDocumentStatusResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (ExpectedDocumentResource, "get", [VIEW_ALL]),
     (ExpectedDocumentResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentResource, "delete", [MINE_CREATE]),
     (ExpectedDocumentUploadResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentUploadResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentUploadResource, "delete", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedMineDocumentResource, "get", [VIEW_ALL]),
     (ExpectedMineDocumentResource, "post", [MINE_CREATE]),
     (MineCommodityCodeResource, "get", [VIEW_ALL]), 
     (MineComplianceSummaryResource, "get", [VIEW_ALL]),
     (MineDisturbanceCodeResource, "get", [VIEW_ALL]),
     (MineDocumentResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineListResource, "post", [MINE_CREATE]),
     (MineListSearch, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineMapResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MinePartyApptResource, "get", [VIEW_ALL]),
     (MinePartyApptResource, "post", [MINE_CREATE]),
     (MinePartyApptResource, "put", [MINE_CREATE]),
     (MinePartyApptResource, "delete", [MINE_CREATE]),
     (MinePartyApptTypeResource, "get", [VIEW_ALL]),
     (MineRegionResource, "get", [VIEW_ALL]),
     (MineResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineResource, "put", [MINE_CREATE]),
     (MineStatusResource, "get", [VIEW_ALL]),
     (MineTailingsStorageFacilityListResource, "get", [VIEW_ALL]),
     (MineTailingsStorageFacilityListResource, "post", [MINE_CREATE]),
     (MineTenureTypeCodeResource, "get", [VIEW_ALL]),
     (MineTypeDetailResource, "post", [MINE_CREATE]),
     (MineTypeDetailResource, "delete", [MINE_CREATE]),
     (MineTypeListResource, "post", [MINE_CREATE]),
     (MineTypeResource, "delete", [MINE_CREATE]),
     (MineVarianceDocumentUploadResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (MineVarianceDocumentUploadResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (MineVarianceUploadedDocumentsResource, "delete", [MINE_CREATE, MINESPACE_PROPONENT]),
     (MineVarianceListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineVarianceListResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (MineVarianceResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (MineVarianceResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (PartyListResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
     (PartyListResource, "post", [MINE_CREATE]),
     (PartyResource, "get", [VIEW_ALL]),
     (PartyResource, "put", [MINE_CREATE]),
     (PartyResource, "delete", [MINE_ADMIN]),
     (PermitResource, "get", [MINE_VIEW]), (PermitListResource, "post", [MINE_CREATE]),
     (PermitResource, "put", [MINE_CREATE]), (PermitAmendmentListResource, "post", [MINE_CREATE]),
     (PermitAmendmentResource, "put", [MINE_CREATE]),
     (PermitAmendmentResource, "delete", [MINE_ADMIN]),
     (PermitAmendmentDocumentListResource, "post", [MINE_CREATE]),
     (PermitAmendmentDocumentListResource, "put", [MINE_CREATE]),
     (PermitAmendmentDocumentResource, "delete", [MINE_CREATE]),
     (RequiredDocumentResource, "get", [VIEW_ALL]),
     (RequiredDocumentResource, "get", [VIEW_ALL]),
     (SearchResource, "get", [VIEW_ALL]),
     (SearchOptionsResource, "get", [VIEW_ALL]),
     (SimpleSearchResource, "get", [VIEW_ALL]),
     (MinespaceUserResource, 'get', [MINE_ADMIN]),
     (MinespaceUserResource, 'post', [MINE_ADMIN]),
     (MinespaceUserResource, 'delete', [MINE_ADMIN]),
     (MinespaceUserMineResource, 'post', [MINE_ADMIN]),
     (MinespaceUserMineResource, 'delete', [MINE_ADMIN])])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
