import uuid, pytest, decimal, math, datetime

from app.extensions import api
from app.api.utils.models_mixins import DictLoadingError
from app.api.now_applications.models.activity_detail.camp_detail import CampDetail
from tests.constants import VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER
from tests.factories import MineFactory, PermitFactory, create_mine_and_permit
from tests.now_application_factories import NOWApplicationIdentityFactory, CampDetailFactory

from flask_restx import marshal, fields

import app.api.now_applications.models
from app.api.now_applications.models.now_application import NOWApplication
from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import PERMIT_MODEL
from app.api.constants import STATE_MODIFIED_DELETE_ON_PUT, PERMIT_EDIT_GROUP
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL, NOW_APPLICATION_ACTIVITY_DETAIL_BASE


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
    now_app_identity = NOWApplicationIdentityFactory(mine=mine)

    mine_dict = {
        'mine': {
            'mine_name': "NEW_MINE_NAME"
        },
    }

    now_app_identity.deep_update_from_dict(mine_dict)
    assert mine.mine_name != 'NEW_MINE_NAME'


def test_update_unexpected_type(db_session):
    mine = MineFactory()
    org_major_mine_ind = mine.major_mine_ind
    mine_dict = {'major_mine_ind': "SHOULD BE BOOLEAN"}
    assert pytest.raises(
        DictLoadingError, mine.deep_update_from_dict, mine_dict, _edit_key=PERMIT_EDIT_GROUP)


def test_update_field_in_nested_item(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    new_reclam_desc = "TEST DESCRIPTIONzzzz"

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    now_app_dict['camp']['reclamation_description'] = new_reclam_desc

    now_app.deep_update_from_dict(now_app_dict)

    db_session.refresh(now_app)
    assert now_app.camp.reclamation_description == new_reclam_desc


#schema implemented for now_application_activity_details only
def test_update_new_now_application_activity_detail(db_session):
    now_app = NOWApplicationIdentityFactory()
    assert len(now_app.now_application.camp.details) == 0

    now_app_dict = marshal(now_app.now_application, NOW_APPLICATION_MODEL)
    new_camp_detail = CampDetail(length=10)
    new_camp_detail_dict = marshal(new_camp_detail, NOW_APPLICATION_ACTIVITY_DETAIL_BASE)

    del new_camp_detail_dict['activity_detail_id']

    now_app_dict['camp']['details'].append(new_camp_detail_dict)

    now_app.now_application.deep_update_from_dict(now_app_dict)

    na = NOWApplication.query.filter_by(now_application_id=now_app.now_application_id).first()
    assert len(na.camp.details) == 1


@pytest.mark.xfail(
    reason='didn\'t mark child records, will violate not null constraint (orphan permit amendment)')
def test_delete_flag_in_nested_item_fail_orphan(db_session):
    init_length = 5
    mine = MineFactory(mine_permit_amendments=init_length)
    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))
    partial_mine_permit_dict['mine_permit'][1]['state_modified'] = STATE_MODIFIED_DELETE_ON_PUT
    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)

    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == init_length - 1


@pytest.mark.xfail(reason='do not allow delete method on soft delete models')
def test_delete_flag_in_nested_item_fail_deleted_ind(db_session):
    init_length = 5
    mine = MineFactory(mine_permit_amendments=init_length)
    partial_mine_permit_dict = marshal(
        {'mine_permit': mine.mine_permit},
        api.model('test_list', {'mine_permit': fields.List(fields.Nested(PERMIT_MODEL))}))

    partial_mine_permit_dict['mine_permit'][1]['state_modified'] = STATE_MODIFIED_DELETE_ON_PUT
    partial_mine_permit_dict['mine_permit'][1]['permit_amendments'][0][
        'state_modified'] = STATE_MODIFIED_DELETE_ON_PUT

    mine.deep_update_from_dict(partial_mine_permit_dict, _edit_key=PERMIT_EDIT_GROUP)
    mine = Mine.query.filter_by(mine_guid=mine.mine_guid).first()
    assert len(mine.mine_permit) == init_length - 1


def test_delete_flag_in_nested_item_success_nested(db_session):
    now_app = NOWApplicationIdentityFactory()
    assert len(now_app.now_application.camp.details) == 0
    new_camp_detail = CampDetail(length=10)
    now_app.now_application.camp.details.append(new_camp_detail)
    assert len(now_app.now_application.camp.details) == 1

    now_app_dict = marshal(now_app.now_application, NOW_APPLICATION_MODEL)
    now_app_dict['camp']['details'][0]['state_modified'] = STATE_MODIFIED_DELETE_ON_PUT

    now_app.now_application.deep_update_from_dict(now_app_dict)

    na = NOWApplication.query.filter_by(now_application_id=now_app.now_application_id).first()
    assert len(na.camp.details) == 0


def test_missing_nested_list_item_not_deleted(db_session):
    init_length = 5
    now_app = NOWApplicationIdentityFactory().now_application
    now_app.camp.details = CampDetailFactory.create_batch(size=init_length)

    assert len(now_app.camp.details) == init_length

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    #remove some items
    now_app_dict['camp']['details'] = now_app_dict['camp']['details'][:2]

    now_app.deep_update_from_dict(now_app_dict)

    db_session.refresh(now_app)
    assert len(now_app.camp.details) == init_length


@pytest.mark.xfail(
    reason='Global marshmallow schemas not implemented, example models have been deleted')
def test_update_new_item_in_list(db_session):
    mine = MineFactory(mine_permit_amendments=5)
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


"""Decimal parsing tests"""


def test_update_decimal_with_string_fails(db_session):
    mine = MineFactory()
    mine_dict = {'latitude': "foo"}
    assert pytest.raises(
        decimal.InvalidOperation,
        mine.deep_update_from_dict,
        mine_dict,
        _edit_key=PERMIT_EDIT_GROUP)


def test_update_decimal_with_empty_list_fails(db_session):
    mine = MineFactory()
    mine_dict = {'latitude': []}
    assert pytest.raises(
        AttributeError, mine.deep_update_from_dict, mine_dict, _edit_key=PERMIT_EDIT_GROUP)


def test_update_decimal_with_empty_string_sets_null(db_session):
    mine = MineFactory()
    mine_dict = {'latitude': ''}
    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert mine.latitude is None


def test_update_decimal_with_null_sets_null(db_session):
    mine = MineFactory()
    mine_dict = {'latitude': None}
    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert mine.latitude is None


def test_update_decimal_with_decimal_passes(db_session):
    mine = MineFactory()
    latitude = decimal.Decimal(12.3456)
    mine_dict = {'latitude': latitude}
    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert math.isclose(mine.latitude, latitude, rel_tol=1e-5)


"""Date parsing tests"""


def test_update_date_with_string_fails(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    now_app_dict['submitted_date'] = 'string'

    assert pytest.raises(ValueError, now_app.deep_update_from_dict, now_app_dict)


def test_update_date_with_empty_list_fails(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    new_date = []

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    now_app_dict['submitted_date'] = new_date
    assert pytest.raises(AttributeError, now_app.deep_update_from_dict, now_app_dict)


def test_update_date_with_empty_string_sets_null(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    now_app_dict['proposed_start_date'] = ''

    now_app.deep_update_from_dict(now_app_dict)

    assert now_app.proposed_start_date is None


def test_update_date_with_null_sets_null(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    now_app_dict['proposed_start_date'] = None

    now_app.deep_update_from_dict(now_app_dict)

    assert now_app.proposed_start_date is None


def test_update_date_with_date_string_passes(db_session):
    now_app = NOWApplicationIdentityFactory().now_application

    now_app_dict = marshal(now_app, NOW_APPLICATION_MODEL)
    date_receive = "2020-03-17"
    date_expect = datetime.date(2020, 3, 17)
    now_app_dict['proposed_start_date'] = date_receive

    now_app.deep_update_from_dict(now_app_dict)

    assert now_app.proposed_start_date == date_expect


"""String parsing tests"""


def test_update_string_with_empty_string_sets_null(db_session):
    mine = MineFactory(mine_permit_amendments=1)
    mine_dict = {'mine_location_description': ''}
    mine.deep_update_from_dict(mine_dict, _edit_key=PERMIT_EDIT_GROUP)
    assert mine.mine_location_description is None