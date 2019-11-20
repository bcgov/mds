import uuid, pytest, decimal

from app.extensions import jwt, api
from app.api.utils.models_mixins import DictLoadingError
from tests.constants import VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER
from tests.factories import MineFactory, PermitFactory

from flask_restplus import marshal, fields

from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import PERMIT_MODEL


def test_update_first_level_info(db_session):
    mine = MineFactory()
    mine.latitude = int(mine.latitude)
    org_major_mine_ind = mine.major_mine_ind
    org_latitude = mine.latitude
    new_latitude = decimal.Decimal(int(org_latitude / 2))
    mine_dict = {
        'mine_name': mine.mine_name + 'edited',
        'major_mine_ind': not mine.major_mine_ind,
        'latitude': new_latitude,
    }

    mine.deep_update_from_dict(mine_dict)
    assert mine.mine_name[-6:] == 'edited'
    assert mine.major_mine_ind != org_major_mine_ind
    assert mine.latitude == new_latitude


def test_update_ignores_pk_change(db_session):
    mine = MineFactory()
    org_mine_guid = mine.mine_guid
    mine_dict = {
        'mine_guid': str(uuid.uuid4()),
    }

    mine.deep_update_from_dict(mine_dict)
    assert mine.mine_guid == org_mine_guid


def test_update_unexpected_type(db_session):
    mine = MineFactory()
    org_major_mine_ind = mine.major_mine_ind
    mine_dict = {'major_mine_ind': "SHOULD BE BOOLEAN"}
    assert pytest.raises(DictLoadingError, mine.deep_update_from_dict, mine_dict)


def test_update_new_item_in_list(db_session):
    mine = MineFactory(mine_permit=5)
    permit = PermitFactory()

    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    new_permit_dict = marshal(permit, PERMIT_MODEL)
    for pa in permit.permit_amendments:
        db_session.delete(pa)
    db_session.delete(permit)

    del new_permit_dict['mine_guid']
    del new_permit_dict['permit_guid']
    #FOR TESTING ONLY, lets Permitid stay because it's correct and
    #postgres sequence doesn't get increased by factory object creation

    partial_mine_permit_dict['mine_permit'].append(new_permit_dict)
    mine.deep_update_from_dict(partial_mine_permit_dict)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == 6