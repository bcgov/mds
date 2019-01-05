import pytest
from app.api.utils.access_decorators import MINE_VIEW, MINE_CREATE

from app.api.document_manager.resources.document_manager import DocumentManagerResource
from app.api.documents.expected.resources.document_status import ExpectedDocumentStatusResource
from app.api.documents.expected.resources.documents import ExpectedDocumentResource
from app.api.documents.expected.resources.expected_document_uploads import ExpectedDocumentUploadResource
from app.api.documents.expected.resources.mine_documents import ExpectedMineDocumentResource
from app.api.documents.mines.resources.mine_document_resource import MineDocumentResource
from app.api.documents.required.resources.required_documents import RequiredDocumentResource
from app.api.mines.compliance.resources.compliance import MineComplianceResource
from app.api.mines.location.resources.location import MineLocationResource
from app.api.mines.mine.resources.mine_commodity_code import MineCommodityCodeResource
from app.api.mines.mine.resources.mine_disturbance_code import MineDisturbanceCodeResource
from app.api.mines.mine.resources.mine_tenure_type_code import MineTenureTypeCodeResource
from app.api.mines.mine.resources.mine_type_detail import MineTypeDetailResource
from app.api.mines.mine.resources.mine_type import MineTypeResource
from app.api.mines.mine.resources.mine import MineResource, MineListByName
from app.api.mines.region.resources.region import MineRegionResource
from app.api.mines.status.resources.status import MineStatusResource
from app.api.mines.tailings.resources.tailings import MineTailingsStorageFacilityResource
from app.api.parties.party_appt.resources.mine_party_appt_resource import MinePartyApptResource
from app.api.parties.party_appt.resources.mine_party_appt_type_resource import MinePartyApptTypeResource
from app.api.parties.party.resources.manager_resource import ManagerResource
from app.api.parties.party.resources.party_resource import PartyResource
from app.api.permits.permit.resources.permit import PermitResource
from app.api.permits.permittee.resources.permittee import PermitteeResource


@pytest.mark.parametrize("resource,method,expected_roles", [
    (DocumentManagerResource, "get", []),
    (DocumentManagerResource, "post", [MINE_CREATE]),
    (ExpectedDocumentStatusResource, "get", []),
    (ExpectedDocumentResource, "get", [MINE_VIEW]),
    (ExpectedDocumentResource, "put", [MINE_CREATE]),
    (ExpectedDocumentResource, "delete", [MINE_CREATE]),
    (ExpectedDocumentUploadResource, "post", [MINE_CREATE]),
    (ExpectedMineDocumentResource, "get", [MINE_VIEW]),
    (ExpectedMineDocumentResource, "post", [MINE_CREATE]),
    (MineDocumentResource, "get", [MINE_VIEW]),
    (MineComplianceResource, "get", [MINE_VIEW]),
    (MineLocationResource, "get", [MINE_VIEW]),
    (MineCommodityCodeResource, "get", [MINE_VIEW]),
    (MineDisturbanceCodeResource, "get", [MINE_VIEW]),
    (MineTenureTypeCodeResource, "get", [MINE_VIEW]),
    (MineTypeDetailResource, "post", [MINE_CREATE]),
    (MineTypeDetailResource, "delete", [MINE_CREATE]),
    (MineTypeResource, "post", [MINE_CREATE]),
    (MineTypeResource, "delete", [MINE_CREATE]),
    (MineResource, "get", [MINE_VIEW]),
    (MineResource, "post", [MINE_VIEW, MINE_CREATE]),
    (MineResource, "put", [MINE_CREATE]),
    (MineListByName, "get", [MINE_VIEW]),
    (MineRegionResource, "get", [MINE_VIEW]),
    (MineStatusResource, "get", [MINE_VIEW]),
    (MineTailingsStorageFacilityResource, "get", []),
    (MineTailingsStorageFacilityResource, "post", []),
    (MinePartyApptResource, "get", [MINE_VIEW]),
    (MinePartyApptResource, "post", [MINE_CREATE]),
    (MinePartyApptResource, "put", [MINE_CREATE]),
    (MinePartyApptResource, "delete", [MINE_CREATE]),
    (MinePartyApptTypeResource, "get", [MINE_VIEW]),
    (ManagerResource, "get", [MINE_VIEW]),
    (ManagerResource, "post", [MINE_CREATE]),
    (PartyResource, "get", [MINE_VIEW]),
    (PartyResource, "post", [MINE_CREATE]),
    (PartyResource, "put", [MINE_CREATE]),
    (PermitResource, "get", [MINE_VIEW]),
    (PermitteeResource, "get", [MINE_VIEW]),
    (PermitteeResource, "post", [MINE_CREATE]),
    (RequiredDocumentResource, "get", [MINE_VIEW]),
])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())
    
    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(assigned_roles), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(resource.__name__, method.upper(), expected_roles, assigned_roles)