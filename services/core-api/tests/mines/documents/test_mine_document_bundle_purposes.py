import uuid

import pytest
from werkzeug.exceptions import BadRequest

from app.api.mines.documents.models.mine_document_bundle import MineDocumentBundle
from app.api.mines.documents.models.spatial_bundle_purpose_code import (
    MineDocumentBundlePurposeXref,
    SpatialBundlePurposeCode,
)
from tests.factories import MineDocumentBundleFactory, MineDocumentFactory


@pytest.fixture
def mine_boundary_purpose(db_session):
    purpose = SpatialBundlePurposeCode.find_by_code('MBD')
    if not purpose:
        purpose = SpatialBundlePurposeCode(
            spatial_bundle_purpose_code='MBD',
            description='Mine Boundary',
            display_order=10,
            active_ind=True,
        )
        purpose.save()
    return purpose


def test_bundle_json_includes_validation_and_purposes(db_session, mine_boundary_purpose):
    bundle = MineDocumentBundleFactory(
        validation_status='VALID',
        validation_error=None,
        validation_checks={'in_bc': True, 'bc_albers': True, 'file_size_gt_0': True},
    )
    MineDocumentBundlePurposeXref(
        bundle_id=bundle.bundle_id, spatial_bundle_purpose_code='MBD').save()
    db_session.refresh(bundle)

    data = bundle.json()
    assert data['validation_status'] == 'VALID'
    assert data['validation_checks']['in_bc'] is True
    assert 'MBD' in data['purpose_codes']


def test_set_purpose_codes(db_session, mine_boundary_purpose):
    bundle = MineDocumentBundleFactory()
    bundle.set_purpose_codes(['MBD'])
    bundle.save()
    assert bundle.purpose_codes == ['MBD']

    bundle.set_purpose_codes([])
    bundle.save()
    assert bundle.purpose_codes == []


def test_set_purpose_codes_rejects_invalid(db_session):
    bundle = MineDocumentBundleFactory()
    with pytest.raises(BadRequest):
        bundle.set_purpose_codes(['ZZZ'])


def test_set_purpose_codes_rejects_none(db_session):
    bundle = MineDocumentBundleFactory()
    with pytest.raises(BadRequest, match='purpose_codes is required'):
        bundle.set_purpose_codes(None)


def test_set_purpose_codes_rejects_newly_assigned_inactive_code(db_session, mine_boundary_purpose):
    bundle = MineDocumentBundleFactory()
    mine_boundary_purpose.active_ind = False
    mine_boundary_purpose.save()

    with pytest.raises(BadRequest, match='Invalid spatial bundle purpose code: MBD'):
        bundle.set_purpose_codes(['MBD'])


def test_set_purpose_codes_keeps_an_already_assigned_inactive_code(db_session,
                                                                  mine_boundary_purpose):
    """Deactivating a code must not lock the bundle's remaining purposes."""
    bundle = MineDocumentBundleFactory()
    bundle.set_purpose_codes(['MBD'])
    bundle.save()

    mine_boundary_purpose.active_ind = False
    mine_boundary_purpose.save()

    bundle.set_purpose_codes(['MBD'])
    bundle.save()
    assert bundle.purpose_codes == ['MBD']

    bundle.set_purpose_codes([])
    bundle.save()
    assert bundle.purpose_codes == []


def test_upsert_preserves_purposes(db_session, mine_boundary_purpose):
    docman_guid = uuid.uuid4()
    mine_doc = MineDocumentFactory(document_manager_guid=uuid.uuid4())
    bundle = MineDocumentBundle(
        name='boundary',
        docman_bundle_guid=docman_guid,
        validation_status='VALID',
    )
    bundle.save()
    mine_doc.mine_document_bundle_id = bundle.bundle_id
    mine_doc.save()
    bundle.set_purpose_codes(['MBD'])
    bundle.save()

    updated = MineDocumentBundle.upsert_from_spatial_result(
        name='boundary',
        docman_bundle_guid=docman_guid,
        document_manager_guids=[str(mine_doc.document_manager_guid)],
        geomark_id='gm-new',
        validation_status='VALID',
        validation_error=None,
        validation_checks={'in_bc': True},
    )
    assert updated.geomark_id == 'gm-new'
    assert updated.purpose_codes == ['MBD']


def test_upsert_preserves_purposes_after_a_code_is_deactivated(db_session, mine_boundary_purpose):
    """Revalidation must not re-validate purposes the user is not changing."""
    docman_guid = uuid.uuid4()
    mine_doc = MineDocumentFactory(document_manager_guid=uuid.uuid4())
    bundle = MineDocumentBundle(
        name='boundary',
        docman_bundle_guid=docman_guid,
        validation_status='VALID',
    )
    bundle.save()
    mine_doc.mine_document_bundle_id = bundle.bundle_id
    mine_doc.save()
    bundle.set_purpose_codes(['MBD'])
    bundle.save()

    mine_boundary_purpose.active_ind = False
    mine_boundary_purpose.save()

    updated = MineDocumentBundle.upsert_from_spatial_result(
        name='boundary',
        docman_bundle_guid=docman_guid,
        document_manager_guids=[str(mine_doc.document_manager_guid)],
        geomark_id='gm-new',
        validation_status='VALID',
    )

    assert updated.purpose_codes == ['MBD']


def test_upsert_replaces_the_whole_validation_snapshot(db_session):
    """A passing revalidation must not leave the previous failure's error or checks behind."""
    docman_guid = uuid.uuid4()
    mine_doc = MineDocumentFactory(document_manager_guid=uuid.uuid4())
    bundle = MineDocumentBundle(
        name='boundary',
        docman_bundle_guid=docman_guid,
        validation_status='UNABLE_TO_VALIDATE',
        validation_error='Missing required file types: .prj',
        validation_checks={'in_bc': None, 'missing_extensions': ['.prj']},
    )
    bundle.save()
    mine_doc.mine_document_bundle_id = bundle.bundle_id
    mine_doc.save()

    updated = MineDocumentBundle.upsert_from_spatial_result(
        name='boundary',
        docman_bundle_guid=docman_guid,
        document_manager_guids=[str(mine_doc.document_manager_guid)],
        geomark_id='gm-new',
        validation_status='VALID',
        validation_error=None,
        validation_checks=None,
        mine_guid=mine_doc.mine_guid,
    )

    assert updated.validation_status == 'VALID'
    assert updated.validation_error is None
    assert updated.validation_checks is None
    assert updated.geomark_id == 'gm-new'


def test_upsert_clears_geomark_after_failed_revalidation(db_session):
    docman_guid = uuid.uuid4()
    mine_doc = MineDocumentFactory(document_manager_guid=uuid.uuid4())
    bundle = MineDocumentBundle(
        name='boundary',
        docman_bundle_guid=docman_guid,
        geomark_id='gm-old',
        validation_status='VALID',
    )
    bundle.save()
    mine_doc.mine_document_bundle_id = bundle.bundle_id
    mine_doc.save()

    updated = MineDocumentBundle.upsert_from_spatial_result(
        name='boundary',
        docman_bundle_guid=docman_guid,
        document_manager_guids=[str(mine_doc.document_manager_guid)],
        geomark_id=None,
        validation_status='INVALID',
        validation_error='Revalidation failed',
        validation_checks={'in_bc': False},
        mine_guid=mine_doc.mine_guid,
    )

    assert updated.geomark_id is None
    assert updated.validation_status == 'INVALID'
