def make_ntr_doc(xref_guid, create_timestamp=None, is_final_package=True, is_system_generated=True):
    return {
        'now_application_document_type_code': 'NTR',
        'now_application_document_xref_guid': xref_guid,
        'is_final_package': is_final_package,
        'is_system_generated': is_system_generated,
        'create_timestamp': create_timestamp,
    }


class TestGetLockedNtrGuid:
    """NOWApplicationExportResource.get_locked_ntr_guid"""

    def test_returns_none_for_empty_list(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        assert NOWApplicationExportResource.get_locked_ntr_guid([]) is None

    def test_returns_none_when_no_ntr_docs(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        doc = {'now_application_document_type_code': 'OTH', 'is_final_package': True, 'is_system_generated': True}
        assert NOWApplicationExportResource.get_locked_ntr_guid([doc]) is None

    def test_returns_none_when_ntr_not_in_final_package(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        doc = make_ntr_doc('guid-1', is_final_package=False)
        assert NOWApplicationExportResource.get_locked_ntr_guid([doc]) is None

    def test_returns_none_when_ntr_not_system_generated(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        doc = make_ntr_doc('guid-1', is_system_generated=False)
        assert NOWApplicationExportResource.get_locked_ntr_guid([doc]) is None

    def test_returns_guid_for_single_qualifying_doc(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        doc = make_ntr_doc('target-guid', create_timestamp='2025-01-15T10:00:00')
        assert NOWApplicationExportResource.get_locked_ntr_guid([doc]) == 'target-guid'

    def test_returns_most_recent_guid_when_multiple_qualify(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        older = make_ntr_doc('old-guid', create_timestamp='2024-06-01T09:00:00')
        newer = make_ntr_doc('new-guid', create_timestamp='2025-01-15T10:00:00')
        assert NOWApplicationExportResource.get_locked_ntr_guid([older, newer]) == 'new-guid'

    def test_returns_guid_when_create_timestamp_is_none(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        doc = make_ntr_doc('no-date-guid', create_timestamp=None)
        assert NOWApplicationExportResource.get_locked_ntr_guid([doc]) == 'no-date-guid'

    def test_ignores_non_system_generated_ntrs_when_mixing(self, app):
        from app.api.now_applications.resources.now_application_export_resource import NOWApplicationExportResource
        manual = make_ntr_doc('manual-guid', create_timestamp='2025-06-01T10:00:00', is_system_generated=False)
        system = make_ntr_doc('system-guid', create_timestamp='2024-01-01T09:00:00', is_system_generated=True)
        assert NOWApplicationExportResource.get_locked_ntr_guid([manual, system]) == 'system-guid'
