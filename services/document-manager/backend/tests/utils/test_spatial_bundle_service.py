from types import SimpleNamespace
from unittest.mock import patch

import pytest
from app import create_app
from app.config import TestConfig
from app.docman.utils.spatial_bundle_service import (
    VALIDATION_STATUS_INVALID,
    VALIDATION_STATUS_UNABLE_TO_VALIDATE,
    VALIDATION_STATUS_VALID,
    SpatialBundleService,
)
from werkzeug.exceptions import BadRequest

GEOMARK_OUT_OF_AREA_ERROR = (
    'Geometry is outside the valid area for coordinate system NAD83 / BC Albers (3005). '
    'Check the geometry and coordinate system.'
)


@pytest.fixture(scope='module', autouse=True)
def app_context():
    """Processing logs through current_app, and also runs on workers with no request context."""
    ctx = create_app(TestConfig).app_context()
    ctx.push()
    yield
    ctx.pop()


def _doc(name, guid=None):
    return SimpleNamespace(
        file_display_name=name,
        document_guid=guid or name,
        document_bundle_guid=None,
        document_bundle=None,
        upload_completed_date=None,
    )


class TestSpatialBundleServiceGrouping:
    def test_groups_shapefile_by_basename(self):
        docs = [
            _doc('boundary.shp'),
            _doc('boundary.shx'),
            _doc('boundary.dbf'),
            _doc('boundary.prj'),
            _doc('other.shp'),
            _doc('site.kmz'),
        ]
        groups = SpatialBundleService.group_documents_by_basename(docs)
        assert len(groups) == 3
        names = {tuple(sorted(d.file_display_name for d in g)) for g in groups}
        assert ('boundary.dbf', 'boundary.prj', 'boundary.shp', 'boundary.shx') in names
        assert ('other.shp',) in names
        assert ('site.kmz',) in names

    def test_ignores_non_spatial(self):
        docs = [_doc('report.pdf'), _doc('notes.txt')]
        assert SpatialBundleService.group_documents_by_basename(docs) == []

    def test_ignores_xml_without_a_shapefile(self):
        docs = [_doc('report.xml'), _doc('notes.sbn')]
        assert SpatialBundleService.group_documents_by_basename(docs) == []

    def test_analyze_complete_shapefile(self):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        analysis = SpatialBundleService.analyze_group(docs)
        assert analysis['complete'] is True
        assert analysis['missing_extensions'] == []
        assert analysis['name'] == 'b'

    def test_analyze_incomplete_shapefile(self):
        docs = [_doc('b.shp'), _doc('b.shx'), _doc('b.dbf')]
        analysis = SpatialBundleService.analyze_group(docs)
        assert analysis['complete'] is False
        assert analysis['missing_extensions'] == ['.prj']

    def test_analyze_kml_single(self):
        analysis = SpatialBundleService.analyze_group([_doc('area.kml')])
        assert analysis['complete'] is True
        assert analysis['is_single_file'] is True


class TestSpatialBundleServiceErrorMapping:
    def test_maps_bc_intersect_error(self):
        checks = SpatialBundleService._map_geomark_error(
            'Geomark must intersect the Province of British Columbia'
        )
        assert checks['in_bc'] is False
        assert checks['bc_albers'] is None

    def test_maps_out_of_area_error(self):
        checks = SpatialBundleService._map_geomark_error(GEOMARK_OUT_OF_AREA_ERROR)
        assert checks['bc_albers'] is False
        assert checks['in_bc'] is None

    def test_unreadable_file_is_not_reported_as_a_projection_failure(self):
        checks = SpatialBundleService._map_geomark_error(
            'Unable to read geometry. Check the file is a valid format=KML - Google Earth file.'
        )
        assert checks['bc_albers'] is None
        assert checks['in_bc'] is None


class TestSpatialBundleServiceProcess:
    @patch('app.docman.utils.spatial_bundle_service.db')
    def test_incomplete_non_blocking_creates_unable_to_validate(self, mock_db):
        docs = [_doc('b.shp'), _doc('b.shx'), _doc('b.dbf')]
        result = SpatialBundleService.process_document_group(docs, blocking=False)
        assert result['validation_status'] == VALIDATION_STATUS_UNABLE_TO_VALIDATE
        assert '.prj' in result['validation_error']
        assert result['docman_bundle_guid'] is not None
        mock_db.session.commit.assert_called()

    def test_incomplete_blocking_raises(self):
        docs = [_doc('b.shp'), _doc('b.shx'), _doc('b.dbf')]
        with pytest.raises(BadRequest):
            SpatialBundleService.process_document_group(docs, blocking=True)

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_valid_geomark_result(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {
            'id': 'gm-test',
            'url': 'https://example/gm-test',
        }
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {
            'geometryType': 'Polygon',
            'minX': 1,
            'minY': 2,
            'maxX': 3,
            'maxY': 4,
        }

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_VALID
        assert result['geomark_id'] == 'gm-test'
        assert result['validation_checks']['in_bc'] is True
        assert result['validation_checks']['bc_albers'] is True
        assert result['validation_checks']['geometryType'] == 'Polygon'
        assert result['validation_checks']['minX'] == 1
        assert 'numVertices' not in result['validation_checks']

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_valid_result_carries_geomark_info_keys(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {'id': 'gm-test'}
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {
            'geometryType': 'Polygon',
            'centroidX': -128.1,
            'centroidY': 54.7,
            'numParts': 1,
            'numVertices': 13,
            'area': 5000000,
            'length': 12500,
            'minimumClearance': 0.0004,
            'isValid': True,
            'isSimple': True,
            'isRobust': False,
        }

        checks = SpatialBundleService.process_document_group(
            docs, name='b', blocking=False)['validation_checks']

        assert checks['numParts'] == 1
        assert checks['numVertices'] == 13
        assert checks['area'] == 5000000
        assert checks['length'] == 12500
        assert checks['minimumClearance'] == 0.0004
        assert checks['isValid'] is True
        assert checks['isSimple'] is True
        assert checks['isRobust'] is False
        assert checks['centroidX'] == -128.1

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_geomark_response_without_id_is_not_marked_valid(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {
            'url': 'https://example/gm-test',
        }

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_UNABLE_TO_VALIDATE
        assert result['validation_error'] == 'Unexpected Geomark response'
        mock_geomark.return_value.fetch_geomark_metadata.assert_not_called()

    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_processing_failure_does_not_expose_exception_details(
        self, _makedirs, _exists, mock_db, mock_upload_helper
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_upload_helper.zip_spatial_files.side_effect = RuntimeError(
            'database password=/secret/private')

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_UNABLE_TO_VALIDATE
        assert result['validation_error'] == 'Unable to process spatial file.'
        assert 'password' not in result['validation_error']

    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_blocking_processing_failure_does_not_persist(self, _makedirs, _exists, mock_db,
                                                          mock_upload_helper):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_upload_helper.zip_spatial_files.side_effect = RuntimeError('disk full')

        with pytest.raises(BadRequest):
            SpatialBundleService.process_document_group(docs, name='b', blocking=True)

        mock_db.session.commit.assert_not_called()

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_invalid_geometry_is_not_marked_valid(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {'id': 'gm-test'}
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {
            'isValid': False,
            'validationError': 'Self-intersection',
        }

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_INVALID
        assert result['validation_error'] == 'Self-intersection'

    def test_already_bundled_group_is_returned_for_core_sync(self):
        bundle = SimpleNamespace(
            name='boundary',
            geomark_id='gm-existing',
            error=None,
            bundle_guid='bundle-guid',
        )
        docs = [_doc(f'boundary.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        for doc in docs:
            doc.document_bundle_guid = bundle.bundle_guid
            doc.document_bundle = bundle

        results = SpatialBundleService.process_all_spatial_documents(docs, blocking=False)

        assert len(results) == 1
        assert results[0]['geomark_id'] == 'gm-existing'
        assert results[0]['validation_status'] == VALIDATION_STATUS_VALID
        assert results[0]['docman_bundle_guid'] == 'bundle-guid'

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_geomark_bc_error_maps_to_invalid(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {
            'error': 'Geomark must intersect the Province of British Columbia',
        }

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_INVALID
        assert result['validation_checks']['in_bc'] is False
        assert result['validation_error'] == (
            'Geomark must intersect the Province of British Columbia')
