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
        instance = MagicMock()
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
        """Only system-generated NTRs are evicted; user-uploaded NTRs stay in the package."""
        from app.api.now_applications.models.now_application import NOWApplication
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_xref.find_by_guid.return_value = MagicMock()

        system_ntr = MagicMock()
        system_ntr.now_application_document_type_code = 'NTR'
        system_ntr.is_system_generated = True
        system_ntr.is_final_package = True

        user_ntr = MagicMock()
        user_ntr.now_application_document_type_code = 'NTR'
        user_ntr.is_system_generated = False
        user_ntr.is_final_package = True

        other_doc = MagicMock()
        other_doc.now_application_document_type_code = 'OTH'
        other_doc.is_final_package = True

        instance = self._make_now_application(NOWApplication, documents=[system_ntr, user_ntr, other_doc])
        instance.add_now_form_to_fap('A description')

        # System-generated NTR is evicted
        assert system_ntr.is_final_package is False
        assert system_ntr.final_package_order is None
        system_ntr.save.assert_called_once()
        # User-uploaded NTR and other docs are untouched
        assert user_ntr.is_final_package is True
        user_ntr.save.assert_not_called()
        assert other_doc.is_final_package is True

    @patch(_XREF_PATH)
    @patch(_DOC_RESOURCE_PATH)
    @patch(_EXPORT_PATH)
    def test_sets_final_package_order_and_description(self, mock_export, mock_doc_resource,
                                                      mock_xref, app):
        """final_package_order and description must be set on the new document."""
        from app.api.now_applications.models.now_application import NOWApplication, LOCKED_NTR_FINAL_PACKAGE_ORDER
        mock_export.get_now_form_generate_token.return_value = 'token-abc'
        mock_doc_resource.generate_now_document.return_value = {
            'now_application_document_xref_guid': 'new-xref-guid'
        }
        mock_now_doc = MagicMock()
        mock_xref.find_by_guid.return_value = mock_now_doc

        instance = self._make_now_application(NOWApplication)
        instance.add_now_form_to_fap('My custom description')

        assert mock_now_doc.final_package_order == LOCKED_NTR_FINAL_PACKAGE_ORDER
        assert mock_now_doc.description == 'My custom description'
        assert mock_now_doc.is_final_package is True
        mock_now_doc.save.assert_called_once()


def _make_ntr_doc(xref_guid, create_timestamp=None, is_final_package=True,
                   is_system_generated=True, deleted_ind=False, type_code='NTR'):
    doc = MagicMock()
    doc.now_application_document_type_code = type_code
    doc.now_application_document_xref_guid = xref_guid
    doc.is_final_package = is_final_package
    doc.is_system_generated = is_system_generated
    doc.deleted_ind = deleted_ind
    doc.create_timestamp = create_timestamp
    return doc


class TestLockedNtrGuid:
    def _get(self, app_module, documents):
        from app.api.now_applications.models.now_application import NOWApplication
        instance = MagicMock()
        instance.documents = documents
        hybrid_descriptor = NOWApplication.__dict__['locked_ntr_guid']
        return hybrid_descriptor.fget(instance)

    def test_returns_none_for_no_documents(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        assert self._get(NOWApplication, []) is None

    def test_returns_none_when_no_ntr_docs(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('guid-1', type_code='OTH')
        assert self._get(NOWApplication, [doc]) is None

    def test_returns_none_when_ntr_not_in_final_package(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('guid-1', is_final_package=False)
        assert self._get(NOWApplication, [doc]) is None

    def test_returns_none_when_ntr_not_system_generated(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('guid-1', is_system_generated=False)
        assert self._get(NOWApplication, [doc]) is None

    def test_returns_none_when_ntr_soft_deleted(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('guid-1', deleted_ind=True)
        assert self._get(NOWApplication, [doc]) is None

    def test_returns_guid_for_single_qualifying_doc(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('target-guid', create_timestamp='2025-01-15T10:00:00')
        assert self._get(NOWApplication, [doc]) == 'target-guid'

    def test_returns_most_recent_guid_when_multiple_qualify(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        older = _make_ntr_doc('old-guid', create_timestamp='2024-06-01T09:00:00')
        newer = _make_ntr_doc('new-guid', create_timestamp='2025-01-15T10:00:00')
        assert self._get(NOWApplication, [older, newer]) == 'new-guid'

    def test_returns_guid_when_create_timestamp_is_none(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        doc = _make_ntr_doc('no-date-guid', create_timestamp=None)
        assert self._get(NOWApplication, [doc]) == 'no-date-guid'

    def test_ignores_non_system_generated_ntrs_when_mixing(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        manual = _make_ntr_doc('manual-guid', create_timestamp='2025-06-01T10:00:00', is_system_generated=False)
        system = _make_ntr_doc('system-guid', create_timestamp='2024-01-01T09:00:00', is_system_generated=True)
        assert self._get(NOWApplication, [manual, system]) == 'system-guid'


def _make_order_doc(final_package_order=None, permit_package_document_type_code=None):
    doc = MagicMock()
    doc.final_package_order = final_package_order
    doc.permit_package_document_type_code = permit_package_document_type_code
    return doc


def _make_now_application_for_order(NOWApplication, documents=None, imported_submission_documents=None):
    instance = MagicMock()
    instance.documents = documents or []
    instance.imported_submission_documents = imported_submission_documents or []
    instance._next_final_package_order = (
        lambda matches=(lambda doc: True), exclude=None: NOWApplication._next_final_package_order(
            instance, matches=matches, exclude=exclude))
    instance.next_document_final_package_order_for_type = (
        lambda permit_package_document_type_code, exclude=None: NOWApplication
        .next_document_final_package_order_for_type(instance, permit_package_document_type_code, exclude=exclude))
    return instance


def _get_next_document_final_package_order(NOWApplication, instance):
    hybrid_descriptor = NOWApplication.__dict__['next_document_final_package_order']
    return hybrid_descriptor.fget(instance)


class TestNextDocumentFinalPackageOrder:
    """Final package order for all documents (type-agnostic)"""

    def test_returns_one_when_no_documents(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        instance = _make_now_application_for_order(NOWApplication)
        assert _get_next_document_final_package_order(NOWApplication, instance) == 1

    def test_returns_max_plus_one_across_documents(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [_make_order_doc(2), _make_order_doc(None), _make_order_doc(5), _make_order_doc(3)]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert _get_next_document_final_package_order(NOWApplication, instance) == 6

    def test_excludes_locked_ntr_order_from_documents(self, app):
        from app.api.now_applications.models.now_application import (
            NOWApplication, LOCKED_NTR_FINAL_PACKAGE_ORDER)
        documents = [_make_order_doc(LOCKED_NTR_FINAL_PACKAGE_ORDER), _make_order_doc(3)]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert _get_next_document_final_package_order(NOWApplication, instance) == 4

    def test_considers_imported_submission_documents_too(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [_make_order_doc(2)]
        imported = [_make_order_doc(7), _make_order_doc(None)]
        instance = _make_now_application_for_order(
            NOWApplication, documents=documents, imported_submission_documents=imported)
        assert _get_next_document_final_package_order(NOWApplication, instance) == 8

    def test_does_not_filter_by_type(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [
            _make_order_doc(9, permit_package_document_type_code='FIGURE'),
            _make_order_doc(1, permit_package_document_type_code='DOCUMENT'),
        ]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert _get_next_document_final_package_order(NOWApplication, instance) == 10


class TestNextDocumentFinalPackageOrderForType:
    """Final package order for documents of a specific type"""

    def test_returns_one_when_no_documents(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        instance = _make_now_application_for_order(NOWApplication)
        assert instance.next_document_final_package_order_for_type('DOCUMENT') == 1

    def test_scopes_independently_per_type(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [
            _make_order_doc(1, permit_package_document_type_code='FIGURE'),
            _make_order_doc(2, permit_package_document_type_code='FIGURE'),
            _make_order_doc(3, permit_package_document_type_code='FIGURE'),
            _make_order_doc(1, permit_package_document_type_code='DOCUMENT'),
        ]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert instance.next_document_final_package_order_for_type('FIGURE') == 4
        assert instance.next_document_final_package_order_for_type('DOCUMENT') == 2

    def test_treats_missing_type_as_document(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [_make_order_doc(4, permit_package_document_type_code=None)]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert instance.next_document_final_package_order_for_type(None) == 5
        assert instance.next_document_final_package_order_for_type('DOCUMENT') == 5

    def test_excludes_locked_ntr_order_from_documents(self, app):
        from app.api.now_applications.models.now_application import (
            NOWApplication, LOCKED_NTR_FINAL_PACKAGE_ORDER)
        documents = [
            _make_order_doc(LOCKED_NTR_FINAL_PACKAGE_ORDER, permit_package_document_type_code='DOCUMENT'),
            _make_order_doc(3, permit_package_document_type_code='DOCUMENT'),
        ]
        instance = _make_now_application_for_order(NOWApplication, documents=documents)
        assert instance.next_document_final_package_order_for_type('DOCUMENT') == 4

    def test_considers_imported_submission_documents_scoped_by_type(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        documents = [_make_order_doc(1, permit_package_document_type_code='DOCUMENT')]
        imported = [
            _make_order_doc(9, permit_package_document_type_code='DOCUMENT'),
            _make_order_doc(20, permit_package_document_type_code='FIGURE'),
        ]
        instance = _make_now_application_for_order(
            NOWApplication, documents=documents, imported_submission_documents=imported)
        assert instance.next_document_final_package_order_for_type('DOCUMENT') == 10
        assert instance.next_document_final_package_order_for_type('FIGURE') == 21


def _make_imported_submission_doc(
    permit_package_document_type_code=None,
    messageid='msg-1',
    xref_guid='xref-guid-1',
    mine_document_guid='mine-doc-guid-1',
    documenturl='http://example.com/doc',
    documenttype='OTH',
    is_final_package=True,
):
    """A submission document that has already been imported into the permit package."""
    doc = MagicMock()
    doc.messageid = messageid
    doc.now_application_document_xref_guid = xref_guid
    doc.mine_document_guid = mine_document_guid
    doc.documenturl = documenturl
    doc.documenttype = documenttype
    doc.description = 'Test description'
    doc.is_final_package = is_final_package
    doc.final_package_order = 1
    doc.is_consultation_package = False
    doc.is_referral_package = False
    doc.filename = 'test-file.pdf'
    doc.now_application_id = 1
    doc.document_manager_guid = 'doc-manager-guid'
    doc.mine_document.mine_document_bundle_id = None
    doc.preamble_title = 'Test Title'
    doc.preamble_author = 'Test Author'
    doc.preamble_date = None
    doc.update_timestamp = None
    doc.permit_package_document_type_code = permit_package_document_type_code
    return doc

class TestGetFilteredSubmissionsDocuments:
    """NOWApplication.get_filtered_submissions_documents

    Tests to ensure that the get_filtered_submissions_documents method correctly 
    surfaces the permit package document type for imported submission documents.
    """

    def _make_now_application(self, imported=None, submission=None):
        instance = MagicMock()
        instance.imported_submission_documents = imported or []
        instance.submission_documents = submission or []
        return instance

    def test_includes_saved_type_for_a_figure_already_in_the_package(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        figure_doc = _make_imported_submission_doc(permit_package_document_type_code='FIGURE')
        now_application = self._make_now_application(imported=[figure_doc])

        docs = NOWApplication.get_filtered_submissions_documents(now_application)

        assert len(docs) == 1
        assert docs[0]['permit_package_document_type_code'] == 'FIGURE'

    def test_includes_saved_type_for_a_document_already_in_the_package(self, app):
        from app.api.now_applications.models.now_application import NOWApplication
        document_doc = _make_imported_submission_doc(permit_package_document_type_code='DOCUMENT')
        now_application = self._make_now_application(imported=[document_doc])

        docs = NOWApplication.get_filtered_submissions_documents(now_application)

        assert docs[0]['permit_package_document_type_code'] == 'DOCUMENT'

    def test_distinguishes_figures_from_documents_across_the_full_list(self, app):
        """The actual bug report scenario: a mix of Figures and Documents already in
        the package must each keep their own correct, distinct type so each one can be
        routed to the right table instead of everything defaulting to Document."""
        from app.api.now_applications.models.now_application import NOWApplication
        figure_doc = _make_imported_submission_doc(
            permit_package_document_type_code='FIGURE', messageid='msg-fig', xref_guid='xref-fig')
        document_doc = _make_imported_submission_doc(
            permit_package_document_type_code='DOCUMENT', messageid='msg-doc', xref_guid='xref-doc')
        now_application = self._make_now_application(imported=[figure_doc, document_doc])

        docs = NOWApplication.get_filtered_submissions_documents(now_application)

        by_guid = {doc['now_application_document_xref_guid']: doc for doc in docs}
        assert by_guid['xref-fig']['permit_package_document_type_code'] == 'FIGURE'
        assert by_guid['xref-doc']['permit_package_document_type_code'] == 'DOCUMENT'
