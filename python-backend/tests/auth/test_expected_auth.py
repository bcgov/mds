import pytest
from app.api.utils.access_decorators import MINE_VIEW, MINE_CREATE, MINE_ADMIN, MINESPACE_PROPONENT

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
from app.api.mines.variances.resources.variance import VarianceResource
from app.api.mines.variances.resources.variance_list import VarianceListResource
from app.api.mines.variances.resources.variance_document_upload import VarianceDocumentUploadResource
from app.api.mines.variances.resources.variance_uploaded_documents import VarianceUploadedDocumentsResource
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.status.resources.status import MineStatusResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityListResource
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource
from app.api.parties.party.resources.party_resource import PartyResource
from app.api.parties.party.resources.party_list_resource import PartyListResource
from app.api.permits.permit.resources.permit import PermitResource
from app.api.permits.permit_amendment.resources.permit_amendment import PermitAmendmentResource
from app.api.permits.permit_amendment.resources.permit_amendment_document import PermitAmendmentDocumentResource
from app.api.users.minespace.resources.minespace_user import MinespaceUserResource
from app.api.users.minespace.resources.minespace_user_mine import MinespaceUserMineResource
from app.api.search.search.resources.search import SearchResource, SearchOptionsResource
from app.api.search.search.resources.simple_search import SimpleSearchResource


@pytest.mark.parametrize(
    "resource,method,expected_roles",
    [(ComplianceArticleResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "get", []),
     (DocumentManagerResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "patch", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DocumentManagerResource, "head", [MINE_CREATE, MINESPACE_PROPONENT]),
     (DownloadTokenResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (ExpectedDocumentStatusResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (ExpectedDocumentResource, "get", [MINE_VIEW]),
     (ExpectedDocumentResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentResource, "delete", [MINE_CREATE]),
     (ExpectedDocumentUploadResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentUploadResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedDocumentUploadResource, "delete", [MINE_CREATE, MINESPACE_PROPONENT]),
     (ExpectedMineDocumentResource, "get", [MINE_VIEW]),
     (ExpectedMineDocumentResource, "post", [MINE_CREATE]),
     (MineCommodityCodeResource, "get", [MINE_VIEW]), 
     (MineComplianceSummaryResource, "get", [MINE_VIEW]),
     (MineDisturbanceCodeResource, "get", [MINE_VIEW]),
     (MineDocumentResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (MineListResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]), 
     (MineListResource, "post", [MINE_CREATE]),
     (MineListSearch, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (MineMapResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (MinePartyApptResource, "get", [MINE_VIEW]),
     (MinePartyApptResource, "post", [MINE_CREATE]), 
     (MinePartyApptResource, "put", [MINE_CREATE]),
     (MinePartyApptResource, "delete", [MINE_CREATE]),
     (MinePartyApptTypeResource, "get", [MINE_VIEW]),
     (MineRegionResource, "get", [MINE_VIEW]),
     (MineResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]), 
     (MineResource, "put", [MINE_CREATE]),
     (MineStatusResource, "get", [MINE_VIEW]),
     (MineTailingsStorageFacilityListResource, "get", [MINE_VIEW]),
     (MineTailingsStorageFacilityListResource, "post", [MINE_CREATE]),
     (MineTenureTypeCodeResource, "get", [MINE_VIEW]),
     (MineTypeDetailResource, "post", [MINE_CREATE]),
     (MineTypeDetailResource, "delete", [MINE_CREATE]),
     (MineTypeListResource, "post", [MINE_CREATE]),
     (MineTypeResource, "delete", [MINE_CREATE]),
     (PartyListResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]),
     (PartyListResource, "post", [MINE_CREATE]),
     (PartyResource, "get", [MINE_VIEW]),
     (PartyResource, "put", [MINE_CREATE]),
     (PartyResource, "delete", [MINE_ADMIN]),
     (PermitResource, "get", [MINE_VIEW]), (PermitResource, "post", [MINE_CREATE]),
     (PermitResource, "put", [MINE_CREATE]), (PermitAmendmentResource, "post", [MINE_CREATE]),
     (PermitAmendmentResource, "put", [MINE_CREATE]),
     (PermitAmendmentResource, "delete", [MINE_ADMIN]),
     (PermitAmendmentDocumentResource, "post", [MINE_CREATE]),
     (PermitAmendmentDocumentResource, "put", [MINE_CREATE]),
     (PermitAmendmentDocumentResource, "delete", [MINE_CREATE]),
     (RequiredDocumentResource, "get", [MINE_VIEW]),
     (RequiredDocumentResource, "get", [MINE_VIEW]),
     (SearchResource, "get", [MINE_VIEW]),
     (SearchOptionsResource, "get", [MINE_VIEW]),
     (SimpleSearchResource, "get", [MINE_VIEW]), 
     (MinespaceUserResource, 'get', [MINE_ADMIN]),
     (MinespaceUserResource, 'post', [MINE_ADMIN]), 
     (MinespaceUserResource, 'delete', [MINE_ADMIN]),
     (MinespaceUserMineResource, 'post', [MINE_ADMIN]),
     (MinespaceUserMineResource, 'delete', [MINE_ADMIN]),
     (VarianceDocumentUploadResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (VarianceDocumentUploadResource, "put", [MINE_CREATE, MINESPACE_PROPONENT]),
     (VarianceUploadedDocumentsResource, "delete", [MINE_CREATE, MINESPACE_PROPONENT]),
     (VarianceListResource, "get", [MINE_VIEW, MINESPACE_PROPONENT]), (VarianceListResource, "post", [MINE_CREATE, MINESPACE_PROPONENT]),
     (VarianceResource, "get", [MINE_VIEW]),
     (VarianceResource, "put", [MINE_CREATE, MINESPACE_PROPONENT])])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
