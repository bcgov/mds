
from app.api.verifiable_credentials.manager import VerifiableCredentialManager

from tests.factories import create_mine_and_permit, PartyFactory, MinePartyAppointmentFactory


class TestVerifiableCredentialManager:
    """test MinesActPermit 1.1.1 attributes"""
    def test_collect_attributes_for_mines_act_permit_111(self, test_client, db_session, auth_headers):
        mine, permit = create_mine_and_permit()
        permittee_appt = MinePartyAppointmentFactory(permittee=True)

        pa = permit.permit_amendments[0]
        permit.bonds[0].bond_status_code = "ACT"
        mine_disturbance_list = [mtd.mine_disturbance_literal for mtd in pa.mine.mine_type[0].mine_type_detail if mtd.mine_disturbance_code]
        mine_commodity_list = [mtd.mine_commodity_literal for mtd in pa.mine.mine_type[0].mine_type_detail if mtd.mine_commodity_code]  
        mine_status_xref = pa.mine.mine_status[0].mine_status_xref

        assert pa.permit_no
        assert permit.permit_status_code_description
        # assert permit.current_permittee
        assert mine_status_xref
        assert pa.mine.mine_no
        assert pa.issue_date
        assert pa.mine.latitude
        assert pa.mine.longitude
        assert permit.active_bond_total

        attribute_list = VerifiableCredentialManager.collect_attributes_for_mines_act_permit_111(pa)
        attributes = {x["name"]: x["value"] for x in attribute_list}

        assert attributes["permit_no"] == pa.permit_no
        assert attributes["permit_status"] == permit.permit_status_code_description
        # assert attributes["permittee_name"] == permit.current_permittee
        assert attributes["mine_operation_status"] == mine_status_xref.mine_operation_status.description
        if mine_status_xref.mine_operation_status_reason:
            assert attributes["mine_operation_status_reason"] == mine_status_xref.mine_operation_status_reason.description 
        if mine_status_xref.mine_operation_status_sub_reason:
            assert attributes["mine_operation_status_sub_reason"] == mine_status_xref.mine_operation_status_sub_reason.description
        if mine_disturbance_list:
            assert attributes["mine_disturbance"]
        if mine_commodity_list:
            assert attributes["mine_commodity"]
        assert attributes["mine_no"] == pa.mine.mine_no
        assert attributes["issue_date"] == pa.issue_date.strftime("%Y%m%d")
        assert attributes["latitude"] == str(pa.mine.latitude)
        assert attributes["longitude"] == str(pa.mine.longitude)
        assert attributes["bond_total"] == str(pa.permit.active_bond_total)