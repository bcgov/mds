"""
Shared rules for replacing and archiving files on a Notice of Work's Manage Documents page.

Both steps of a replace (starting the upload, then recording the new version) run the same checks. They must run
on the first step: Document Manager makes the uploaded file current as soon as the upload finishes, before Core
records the version.
"""
import os

from werkzeug.exceptions import BadRequest, NotFound

from app.api.constants import NOW_APPLICATION_LOCKED_STATUS_CODES, NOW_SPATIAL_FILE_EXTENSIONS
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref

APPLICATION_DOCUMENT_SUB_TYPE_CODES = ['AAF', 'MDO', 'SDO']
GOVERNMENT_DOCUMENT_SUB_TYPE_CODE = 'GDO'


def get_now_document_for_file_management(application_guid, mine_document_guid):
    """
    Returns (now_application_identity, mine_document, xref) for a document on the given NoW, where xref is
    either a NOWApplicationDocumentXref (added in Core) or a NOWApplicationDocumentIdentityXref (imported from vFCBC).
    """
    now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
    if not now_application_identity:
        raise NotFound('No identity record for this application guid.')

    mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)
    if not mine_document:
        raise NotFound('Mine document not found.')

    xref = mine_document.now_application_document_xref or mine_document.now_application_document_identity_xref
    if not xref or xref.deleted_ind or xref.now_application_id != now_application_identity.now_application_id:
        raise NotFound('Document not found on this application.')

    return now_application_identity, mine_document, xref


def check_can_replace(now_application_identity, mine_document, xref, new_filename=None):
    """
    Raises BadRequest if the document's file can't be replaced. new_filename is only known when the upload starts,
    so the extension match is checked then.
    """
    _check_file_management_rules(now_application_identity, mine_document, xref)

    if _get_file_extension(mine_document.document_name) in NOW_SPATIAL_FILE_EXTENSIONS:
        raise BadRequest('Spatial files cannot be replaced. Archive the file and upload a new one instead.')

    if new_filename is not None and _get_file_extension(new_filename) != _get_file_extension(mine_document.document_name):
        raise BadRequest('The new file must be the same file type as the original.')


def check_can_archive(now_application_identity, mine_document, xref):
    """
    Raises BadRequest if the document can't be archived. Unlike replace, spatial files can be archived.
    """
    _check_file_management_rules(now_application_identity, mine_document, xref)


def _check_file_management_rules(now_application_identity, mine_document, xref):
    """
    Rules shared by replace and archive. These mirror when a document can be edited or deleted on the Manage
    Documents page, with one exception: Application and Government documents outside the permit package can still
    be changed after a decision is made.
    """
    if mine_document.is_archived:
        raise BadRequest('This document has been archived.')

    # Only Core-added documents can be system-generated (e.g. the locked Notice of Work Application form)
    if getattr(xref, 'is_system_generated', False):
        raise BadRequest('System-generated documents cannot be changed.')

    # Referral and Consultation package files keep their existing behaviour, even when also in the permit package
    if xref.is_referral_package or xref.is_consultation_package:
        raise BadRequest('Documents in a Referral or Consultation package cannot be changed.')

    is_locked = now_application_identity.now_application.now_application_status_code in NOW_APPLICATION_LOCKED_STATUS_CODES
    is_delayed = any(delay.end_date is None for delay in now_application_identity.application_delays)

    if xref.is_final_package:
        if is_locked:
            raise BadRequest('Permit package documents cannot be changed once the application has a decision.')
        if is_delayed:
            raise BadRequest('Permit package documents cannot be changed while the application is delayed.')
        return

    # vFCBC imports have no sub-type, and always belong to Application Documents
    if isinstance(xref, NOWApplicationDocumentIdentityXref):
        return

    sub_type_code = xref.now_application_document_sub_type_code
    if sub_type_code in APPLICATION_DOCUMENT_SUB_TYPE_CODES:
        return

    if sub_type_code == GOVERNMENT_DOCUMENT_SUB_TYPE_CODE:
        if is_delayed:
            raise BadRequest('Government documents cannot be changed while the application is delayed.')
        return

    raise BadRequest('This document cannot be changed from Manage Documents.')


def _get_file_extension(filename):
    filename = (filename or '').lower()
    # .shp.xml is a two-part extension, so splitext alone would read it as .xml
    if filename.endswith('.shp.xml'):
        return '.shp.xml'
    return os.path.splitext(filename)[1]
