import os
import zipfile
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from app import create_app
from app.config import TestConfig
from app.docman.utils.spatial_bundle_service import (
    BC_ALBERS_PROJECTION,
    UTM_PROJECTION_DESCRIPTION,
    VALIDATION_STATUS_INVALID,
    VALIDATION_STATUS_UNABLE_TO_VALIDATE,
    VALIDATION_STATUS_VALID,
    SpatialBundleService,
)
from werkzeug.exceptions import BadRequest

UTM_PRJ_WKT = (
    'PROJCS["NAD83 / UTM zone 10N",GEOGCS["NAD83",DATUM["North_American_Datum_1983",'
    'SPHEROID["GRS 1980",6378137,298.257222101]],AUTHORITY["EPSG","4269"]],'
    'PROJECTION["Transverse_Mercator"],UNIT["metre",1],AUTHORITY["EPSG","26910"]]'
)

ALBERS_PRJ_WKT = (
    'PROJCS["NAD83 / BC Albers",GEOGCS["NAD83",DATUM["North_American_Datum_1983",'
    'SPHEROID["GRS 1980",6378137,298.257222101]],AUTHORITY["EPSG","4269"]],'
    'PROJECTION["Albers_Conic_Equal_Area"],UNIT["metre",1],AUTHORITY["EPSG","3005"]]'
)

# Verbatim response from the Geomark test instance for UTM coordinates sent with srid=3005.
GEOMARK_OUT_OF_AREA_ERROR = (
    'Geometry: SRID=3005;POLYGON Z((610061.4014517411 5922669.359998861 0,'
    '610060.589360085 5922670.234380949 0,610200 5922700 0,'
    '610061.4014517411 5922669.359998861 0)) Source Geometry Factory: NAD83 / BC Albers, '
    'coordinateSystemId=3005, axisCount=3 Area Bounding Box: '
    'SRID=3005;BBOX(34758.7487168255 359549.2446022164,1883159.4990994572 1736633.684218184) '
    'Geometry Bounding Box: SRID=3005;BBOX(610060.589360085 5922669.359998861,610200 5922700) '
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
        assert SpatialBundleService._expected_projection(analysis) == 'WGS 84 (EPSG:4326)'

    def test_kmz_expects_wgs84(self):
        analysis = SpatialBundleService.analyze_group([_doc('area.kmz')])
        assert SpatialBundleService._expected_projection(analysis) == 'WGS 84 (EPSG:4326)'


class TestSpatialBundleServiceErrorMapping:
    def test_maps_bc_intersect_error(self):
        checks = SpatialBundleService._map_geomark_error(
            'Geomark must intersect the Province of British Columbia'
        )
        assert checks['in_bc'] is False
        assert checks['bc_albers'] is True

    def test_maps_projection_error(self):
        checks = SpatialBundleService._map_geomark_error(
            'Unable to read geometry. Found: NAD83 / UTM zone 10N'
        )
        assert checks['bc_albers'] is False
        assert checks['found_projection'] == 'NAD83 / UTM zone 10N'

    def test_does_not_report_the_declared_srid_as_the_found_projection(self):
        """Geomark echoes the srid we sent, which previously read back as 'found: BC Albers'."""
        checks = SpatialBundleService._map_geomark_error(GEOMARK_OUT_OF_AREA_ERROR)

        assert checks['bc_albers'] is False
        assert 'albers' not in (checks['found_projection'] or '').lower()
        assert checks['found_projection'] == UTM_PROJECTION_DESCRIPTION
        assert checks['expected_projection'] == BC_ALBERS_PROJECTION

    def test_infers_geographic_coordinates(self):
        checks = SpatialBundleService._map_geomark_error(
            'Geometry Bounding Box: SRID=3005;BBOX(-123.4 49.2,-123.3 49.3) '
            'Geometry is outside the valid area for coordinate system NAD83 / BC Albers (3005).'
        )

        assert checks['found_projection'] == 'geographic latitude/longitude (e.g. WGS 84)'

    def test_unreadable_file_is_not_reported_as_a_projection_failure(self):
        error = 'Unable to read geometry. Check the file is a valid format=KML - Google Earth file.'

        checks = SpatialBundleService._map_geomark_error(error)

        assert checks['bc_albers'] is None
        assert checks['found_projection'] is None
        assert SpatialBundleService._user_facing_error(error, checks) == error

    def test_parses_prj_projection_name_and_epsg(self):
        assert SpatialBundleService._parse_prj_wkt(UTM_PRJ_WKT) == (
            'NAD83 / UTM zone 10N (EPSG:26910)')
        assert SpatialBundleService._parse_prj_wkt(ALBERS_PRJ_WKT) == (
            'NAD83 / BC Albers (EPSG:3005)')
        assert SpatialBundleService._parse_prj_wkt('not wkt') is None


class TestSpatialBundleServiceMessaging:
    def test_reports_mismatch_between_prj_and_coordinates(self):
        checks = SpatialBundleService._map_geomark_error(GEOMARK_OUT_OF_AREA_ERROR)
        checks['declared_projection'] = 'NAD83 / BC Albers (EPSG:3005)'

        message = SpatialBundleService._user_facing_error(GEOMARK_OUT_OF_AREA_ERROR, checks)

        assert 'must be in the NAD83 / BC Albers (EPSG:3005) projection' in message
        assert 'appear to be in UTM (northern hemisphere)' in message
        assert 'Re-project' in message
        assert 'SRID=3005;POLYGON' not in message

    def test_reports_the_projection_declared_by_the_prj(self):
        checks = SpatialBundleService._map_geomark_error(GEOMARK_OUT_OF_AREA_ERROR)
        checks['declared_projection'] = 'NAD83 / UTM zone 10N (EPSG:26910)'

        message = SpatialBundleService._user_facing_error(GEOMARK_OUT_OF_AREA_ERROR, checks)

        assert 'The .prj file declares NAD83 / UTM zone 10N (EPSG:26910).' in message

    def test_reports_location_failure_separately_from_projection(self):
        error = 'Geomark must intersect the Province of British Columbia'
        checks = SpatialBundleService._map_geomark_error(error)

        message = SpatialBundleService._user_facing_error(error, checks)

        assert message == 'Spatial file must be located within the Province of British Columbia.'


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
            'geometry_type': 'Polygon',
            'extent': {'minX': 1, 'minY': 2, 'maxX': 3, 'maxY': 4},
        }

        result = SpatialBundleService.process_document_group(docs, name='b', blocking=False)

        assert result['validation_status'] == VALIDATION_STATUS_VALID
        assert result['geomark_id'] == 'gm-test'
        assert result['validation_checks']['in_bc'] is True
        assert result['validation_checks']['bc_albers'] is True
        assert result['validation_checks']['geometry_type'] == 'Polygon'
        # Attribution Geomark did not report stays absent rather than being invented.
        assert result['validation_checks']['num_vertices'] is None
        assert result['validation_checks']['is_valid'] is None

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    @patch('app.docman.utils.spatial_bundle_service.os.makedirs')
    def test_valid_result_carries_the_full_geomark_attribution(
        self, _makedirs, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark
    ):
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {'id': 'gm-test'}
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {
            'geometry_type': 'Polygon',
            'extent': {'minX': 1, 'minY': 2, 'maxX': 3, 'maxY': 4},
            'centroid': {'centroidX': -128.1, 'centroidY': 54.7},
            'num_parts': 1,
            'num_vertices': 13,
            'area': 5000000,
            'length': 12500,
            'minimum_clearance': 0.0004,
            'is_valid': True,
            'is_simple': True,
            'is_robust': False,
            'geometry_validation_error': None,
        }

        checks = SpatialBundleService.process_document_group(
            docs, name='b', blocking=False)['validation_checks']

        assert checks['num_parts'] == 1
        assert checks['num_vertices'] == 13
        assert checks['area'] == 5000000
        assert checks['length'] == 12500
        assert checks['minimum_clearance'] == 0.0004
        assert checks['is_valid'] is True
        assert checks['is_simple'] is True
        assert checks['is_robust'] is False
        assert checks['centroid'] == {'centroidX': -128.1, 'centroidY': 54.7}

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
            'is_valid': False,
            'geometry_validation_error': 'Self-intersection',
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


def _write_bundle_zip(prj_wkt):
    """Stands in for zip_spatial_files so the real .prj is read back off disk."""

    def write(_documents, file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with zipfile.ZipFile(file_path, 'w') as archive:
            archive.writestr('b.shp', b'\x00')
            archive.writestr('b.shx', b'\x00')
            archive.writestr('b.dbf', b'\x00')
            archive.writestr('b.prj', prj_wkt)

    return write


class TestSpatialBundleServiceUtmFile:
    """A UTM shapefile is correctly rejected; the checks must say so without contradicting themselves."""

    @patch('app.docman.utils.spatial_bundle_service.GeomarkHelper')
    @patch('app.docman.utils.spatial_bundle_service.DocumentUploadHelper')
    @patch('app.docman.utils.spatial_bundle_service.db')
    @patch('app.docman.utils.spatial_bundle_service.os.path.exists', return_value=True)
    @patch('app.docman.utils.spatial_bundle_service.os.path.getsize', return_value=100)
    def _process(self, prj_wkt, _getsize, _exists, mock_db, mock_upload_helper, mock_geomark):
        mock_upload_helper.zip_spatial_files.side_effect = _write_bundle_zip(prj_wkt)
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {
            'error': GEOMARK_OUT_OF_AREA_ERROR,
        }
        docs = [_doc(f'b.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        return SpatialBundleService.process_document_group(docs, name='b', blocking=False)

    def test_mislabelled_bc_albers_file_is_rejected_without_contradiction(self):
        result = self._process(ALBERS_PRJ_WKT)
        checks = result['validation_checks']

        assert result['validation_status'] == VALIDATION_STATUS_INVALID
        assert checks['bc_albers'] is False
        assert checks['found_projection'] == UTM_PROJECTION_DESCRIPTION
        assert checks['declared_projection'] == BC_ALBERS_PROJECTION
        assert checks['expected_projection'] == BC_ALBERS_PROJECTION
        assert 'The .prj file declares NAD83 / BC Albers (EPSG:3005), but the coordinates' in (
            result['validation_error'])
        assert 'SRID=3005;POLYGON' not in result['validation_error']

    def test_utm_labelled_file_names_its_own_projection(self):
        result = self._process(UTM_PRJ_WKT)
        checks = result['validation_checks']

        assert result['validation_status'] == VALIDATION_STATUS_INVALID
        assert checks['declared_projection'] == 'NAD83 / UTM zone 10N (EPSG:26910)'
        assert 'NAD83 / UTM zone 10N (EPSG:26910)' in result['validation_error']
        assert 'Re-project the file to NAD83 / BC Albers (EPSG:3005)' in result['validation_error']

    def test_no_check_claims_bc_albers_while_rejecting_for_it(self):
        checks = self._process(ALBERS_PRJ_WKT)['validation_checks']

        assert not (checks['bc_albers'] is False
                    and 'albers' in (checks['found_projection'] or '').lower())
