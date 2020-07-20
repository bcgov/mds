from datetime import datetime
from flask import current_app
import uuid, pytest

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from tests.factories import PermitFactory, MineFactory, PermitAmendmentFactory, MinePermitXrefFactory, create_mine_and_permit


def test_permit_used_by_multiple_mines(db_session):
    mine, permit = create_mine_and_permit()
    mine2 = MineFactory(mine_permit_amendments=0)
    permit._all_mines.append(mine2)              # create xref. ideally pa Factory would make this
    PermitAmendmentFactory(mine=mine2, permit=permit)

    assert len(mine.mine_permit) == 2
    assert len(mine2.mine_permit) == 2
    assert mine.mine_permit[0] in mine2.mine_permit