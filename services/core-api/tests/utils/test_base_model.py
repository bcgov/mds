import uuid, pytest, decimal

from app.extensions import jwt, api
from app.api.utils.models_mixins import DictLoadingError
from tests.constants import VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER
from tests.factories import MineFactory, PermitFactory

from flask_restplus import marshal, fields

from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import PERMIT_MODEL
from app.api.constants import DELETE_ITEM_FROM_LIST_JSON_KEY, PERMIT_EDIT_GROUP


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

    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert mine.mine_name[-6:] == 'edited'
    assert mine.major_mine_ind != org_major_mine_ind
    assert mine.latitude == new_latitude


def test_update_ignores_pk_change(db_session):
    mine = MineFactory()
    org_mine_guid = mine.mine_guid
    mine_dict = {
        'mine_guid': str(uuid.uuid4()),
    }

    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert mine.mine_guid == org_mine_guid


def test_update_ignores_related_object_not_in_edit_group(db_session):
    mine = MineFactory()
    mine_dict = {
        'mine': {
            'mine_name': "NEW_MINE_NAME"
        },
    }

    mine.mine_permit[0].deep_update_from_dict(mine_dict)
    assert mine.mine_name != 'NEW_MINE_NAME'


def test_update_unexpected_type(db_session):
    mine = MineFactory()
    org_major_mine_ind = mine.major_mine_ind
    mine_dict = {'major_mine_ind': "SHOULD BE BOOLEAN"}
    assert pytest.raises(
        DictLoadingError, mine.deep_update_from_dict, mine_dict, _edit_key=PERMIT_EDIT_GROUP)


def test_update_field_in_nested_item(db_session):
    mine = MineFactory(mine_permit=5)
    new_permit_no = 'XXX-9999'
    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    partial_mine_permit_dict['mine_permit'][1]['permit_no'] = new_permit_no
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert mine.mine_permit[1].permit_no == new_permit_no


@pytest.mark.xfail(
    reason='didn\'t mark child records, will violate not null constraint (orphan permit amendment)')
def test_delete_flag_in_nested_item_fail_orphan(db_session):
    init_length = 5
    mine = MineFactory(mine_permit=init_length)
    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    partial_mine_permit_dict['mine_permit'][1][DELETE_ITEM_FROM_LIST_JSON_KEY] = True
    print(partial_mine_permit_dict)
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == init_length - 1


def test_delete_flag_in_nested_item_success_nested(db_session):
    init_length = 5
    mine = MineFactory(mine_permit=init_length)
    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    partial_mine_permit_dict['mine_permit'][1][DELETE_ITEM_FROM_LIST_JSON_KEY] = True
    partial_mine_permit_dict['mine_permit'][1]['permit_amendments'][0][
        DELETE_ITEM_FROM_LIST_JSON_KEY] = True
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)
    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == init_length - 1


def test_missing_nested_item_not_deleted(db_session):
    init_length = 5
    mine = MineFactory(mine_permit=init_length)

    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    partial_mine_permit_dict['mine_permit'] = partial_mine_permit_dict['mine_permit'][:2]
    assert len(partial_mine_permit_dict['mine_permit']) < init_length
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == init_length


@pytest.mark.xfail(
    reason='Global marshmallow schemas not implemented, example models have been deleted')
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
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == 6
    assert all(len(p.permit_amendments) > 0 for p in mine.mine_permit)