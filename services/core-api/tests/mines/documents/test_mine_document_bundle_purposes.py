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
            is_exclusive_per_parent=False,
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


def test_exclusive_purpose_rejects_sibling(db_session):
    exclusive = SpatialBundlePurposeCode.find_by_code('EXC')
    if not exclusive:
        exclusive = SpatialBundlePurposeCode(
            spatial_bundle_purpose_code='EXC',
            description='Exclusive Test',
            display_order=99,
            active_ind=True,
            is_exclusive_per_parent=True,
        )
        exclusive.save()

    first = MineDocumentBundleFactory()
    second = MineDocumentBundleFactory()
    first.set_purpose_codes(['EXC'])
    first.save()

    with pytest.raises(BadRequest):
        second.set_purpose_codes(['EXC'], sibling_bundle_ids=[first.bundle_id, second.bundle_id])


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
        preserve_purposes=True,
    )
    assert updated.geomark_id == 'gm-new'
    assert 'MBD' in updated.purpose_codes
