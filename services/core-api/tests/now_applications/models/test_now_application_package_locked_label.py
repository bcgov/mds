from sqlalchemy import event

from app.api.now_applications.models.now_application_consultation_package import NOWApplicationConsultationPackage
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.now_application_referral_package import NOWApplicationReferralPackage
from tests.factories import MineDocumentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory


def _make_package_document(db_session, now_application_identity, **xref_fields):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_document.mine_document_guid,
        now_application_document_type_code='OTH',
        **xref_fields)
    db_session.add(xref)
    db_session.commit()
    return mine_document, xref


class TestPackageLockedLabel:

    def test_no_label_for_a_document_outside_the_packages(self, db_session):
        identity = NOWApplicationIdentityFactory()
        _, xref = _make_package_document(db_session, identity)

        assert xref.package_locked_label is None
        assert xref.has_package_snapshot is True

    def test_label_names_the_package_without_a_snapshot(self, db_session):
        identity = NOWApplicationIdentityFactory()
        _, referral_xref = _make_package_document(db_session, identity, is_referral_package=True)
        _, consultation_xref = _make_package_document(db_session, identity, is_consultation_package=True)

        assert referral_xref.package_locked_label == 'Referral'
        assert consultation_xref.package_locked_label == 'Consultation'
        assert referral_xref.has_package_snapshot is False

    def test_label_is_cleared_once_the_package_is_saved(self, db_session):
        identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_package_document(db_session, identity, is_referral_package=True)
        assert xref.package_locked_label == 'Referral'

        NOWApplicationReferralPackage.create(identity.now_application, [mine_document])

        assert xref.package_locked_label is None

    def test_label_is_the_package_locking_a_file_that_is_in_both(self, db_session):
        identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_package_document(
            db_session, identity, is_referral_package=True, is_consultation_package=True)
        NOWApplicationConsultationPackage.create(identity.now_application, [mine_document])

        # Re-saving the Consultation package wouldn't unlock this file, the Referral one is locking it
        assert xref.package_locked_label == 'Referral'

    def test_label_names_both_packages_when_neither_has_a_snapshot(self, db_session):
        identity = NOWApplicationIdentityFactory()
        _, xref = _make_package_document(
            db_session, identity, is_referral_package=True, is_consultation_package=True)

        assert xref.package_locked_label == 'Consultation and Referral'

    def test_snapshots_are_looked_up_once_per_application(self, db_session):
        identity = NOWApplicationIdentityFactory()
        xrefs = [
            _make_package_document(db_session, identity, is_referral_package=True)[1] for _ in range(5)
        ]
        # Loaded up front so only the snapshot lookups are counted
        guids = [x.mine_document_guid for x in xrefs]
        assert len(guids) == 5

        statements = []

        def count_package_queries(conn, cursor, statement, *args):
            if 'package_document_xref' in statement or '_package_document' in statement:
                statements.append(statement)

        engine = db_session.get_bind()
        event.listen(engine, 'before_cursor_execute', count_package_queries)
        try:
            labels = [x.package_locked_label for x in xrefs]
        finally:
            event.remove(engine, 'before_cursor_execute', count_package_queries)

        assert labels == ['Referral'] * 5
        # One query per package type, however many documents there are
        assert len(statements) == 2
