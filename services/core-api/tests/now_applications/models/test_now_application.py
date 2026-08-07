from datetime import date
from unittest.mock import MagicMock, patch

_XREF_PATH = 'app.api.now_applications.models.now_application_document_xref.NOWApplicationDocumentXref'
_EXPORT_PATH = 'app.api.now_applications.resources.now_application_export_resource.NOWApplicationExportResource'
_DOC_RESOURCE_PATH = 'app.api.document_generation.resources.now_document_resource.NoticeOfWorkDocumentResource'


class TestAddNowFormToFap:
    """NOWApplication.add_now_form_to_fap"""

    def _make_now_application(self, app_module, documents=None):
        """Build a minimal NOWApplication-like object backed by mocks."""
        NOWApplication = app_module
        instance = MagicMock(spec=NOWApplication)
        instance.now_application_guid = 'test-now-guid'
        instance.next_document_final_package_order = 5
        instance.documents = documents or []
        instance.add_now_form_to_fap = lambda description: NOWApplication.add_now_form_to_fap(
            instance, description)
        return instance

    @patch(_XREF_PATH)
    @patch(_DOC_RESOURCE_PATH)
    @patch(_EXPORT_PATH)
    def test_sets_is_system_generated_true(self, mock_export, mock_doc_resource, mock_xref, app):
        """The newly created NTR document must be flagged as system-generated."""
        from app.api.now_applications.models.now_application import NOWApplication
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_now_doc = MagicMock()
        mock_xref.find_by_guid.return_value = mock_now_doc

        instance = self._make_now_application(NOWApplication)
        instance.add_now_form_to_fap('Test description')

        assert mock_now_doc.is_system_generated is True

    @patch(_XREF_PATH)
    @patch(_DOC_RESOURCE_PATH)
    @patch(_EXPORT_PATH)
    def test_sets_preamble_fields(self, mock_export, mock_doc_resource, mock_xref, app):
        """Preamble title, author, and date must be set on the new document."""
        from app.api.now_applications.models.now_application import NOWApplication
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_now_doc = MagicMock()
        mock_xref.find_by_guid.return_value = mock_now_doc

        instance = self._make_now_application(NOWApplication)
        instance.add_now_form_to_fap('A description')

        assert mock_now_doc.preamble_title == 'Notice of Work Application'
        assert mock_now_doc.preamble_author == 'N/A'
        assert mock_now_doc.preamble_date == date.today()

    @patch(_XREF_PATH)
    @patch(_DOC_RESOURCE_PATH)
    @patch(_EXPORT_PATH)
    def test_excludes_previous_ntr_docs_from_final_package(self, mock_export, mock_doc_resource,
                                                            mock_xref, app):
        """Existing NTR documents must be removed from the final package."""
        from app.api.now_applications.models.now_application import NOWApplication
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_xref.find_by_guid.return_value = MagicMock()

        old_ntr = MagicMock()
        old_ntr.now_application_document_type_code = 'NTR'
        old_ntr.is_final_package = True

        other_doc = MagicMock()
        other_doc.now_application_document_type_code = 'OTH'
        other_doc.is_final_package = True

        instance = self._make_now_application(NOWApplication, documents=[old_ntr, other_doc])
        instance.add_now_form_to_fap('A description')

        assert old_ntr.is_final_package is False
        assert old_ntr.final_package_order is None
        old_ntr.save.assert_called_once()
        assert other_doc.is_final_package is True

    @patch(_XREF_PATH)
    @patch(_DOC_RESOURCE_PATH)
    @patch(_EXPORT_PATH)
    def test_sets_final_package_order_and_description(self, mock_export, mock_doc_resource,
                                                      mock_xref, app):
        """final_package_order and description must be set on the new document."""
        from app.api.now_applications.models.now_application import NOWApplication
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_now_doc = MagicMock()
        mock_xref.find_by_guid.return_value = mock_now_doc

        instance = self._make_now_application(NOWApplication)
        instance.add_now_form_to_fap('My custom description')

        assert mock_now_doc.final_package_order == 5
        assert mock_now_doc.description == 'My custom description'
        assert mock_now_doc.is_final_package is True
        mock_now_doc.save.assert_called_once()
