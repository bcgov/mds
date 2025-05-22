from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineFactory, PermitAmendmentFactory, PermitFactory

class TestNOWApplicationIdentityTransfer:

    def test_transfer_now_application_without_draft_permit(self, db_session):
        # Create a NOW application without a draft permit
        mine = MineFactory(minimal=True)
        now_application_identity = NOWApplicationIdentityFactory(
            now_application=NOWApplicationFactory(), mine=mine, now_number=str(mine.mine_no) + '-2023'
        )

        # Transfer the application to a new mine
        new_mine = MineFactory()
        now_application_identity.transfer(new_mine)

        assert now_application_identity.mine == new_mine
        assert now_application_identity.now_number.startswith(new_mine.mine_no)
        for document in now_application_identity.now_application.documents:
            assert document.mine_document.mine_guid == new_mine.mine_guid

    def test_transfer_now_application_with_draft_permit(self, db_session):
        # Create a NOW application with a draft permit
        mine = MineFactory()
        permit = PermitFactory()
        permit._all_mines.append(mine)   
        permit._context_mine = mine 

        now_application_identity = NOWApplicationIdentityFactory(
            now_application=NOWApplicationFactory(), mine=mine, now_number=str(mine.mine_no) + '-2023'
        )

        draft_permit_amendment = PermitAmendmentFactory(
            mine=mine,
            permit=permit,
            now_application_guid=now_application_identity.now_application_guid,
            permit_amendment_status_code='DFT'
        )

        # Transfer the application to a new mine
        new_mine = MineFactory()
        now_application_identity.transfer(new_mine)

        assert now_application_identity.mine == new_mine
        assert now_application_identity.now_number.startswith(new_mine.mine_no)
        for document in now_application_identity.now_application.documents:
            assert document.mine_document.mine_guid == new_mine.mine_guid