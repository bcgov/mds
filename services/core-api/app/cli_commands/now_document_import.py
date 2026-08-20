"""
Local/dev CLI helpers to seed NOW data for document-import testing.

WARNING: Only intended for local, dev, and test environments.
"""
import json
import uuid
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from pathlib import Path

import click
from flask.cli import AppGroup

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_document_identity_xref import (
    NOWApplicationDocumentIdentityXref,
)
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_type import NOWApplicationType
from app.api.now_submissions.models.application import Application as NOWSubmission
from app.api.now_submissions.models.document import Document as NOWSubmissionDocument
from app.config import Config
from app.extensions import db

ALLOWED_ENVIRONMENTS = ('local', 'dev', 'test')

now_cli = AppGroup(
    'now',
    help='Notice of Work helpers for local document-import testing.',
)


def _assert_safe_environment():
    if Config.ENVIRONMENT_NAME not in ALLOWED_ENVIRONMENTS:
        raise click.ClickException(
            'These commands are only available in local, dev, and test environments '
            f'(current: {Config.ENVIRONMENT_NAME}).')


def _load_payload(payload_path):
    path = Path(payload_path)
    if not path.is_file():
        raise click.ClickException(f'Payload file not found: {payload_path}')
    try:
        with path.open('r', encoding='utf-8') as handle:
            payload = json.load(handle)
    except json.JSONDecodeError as exc:
        raise click.ClickException(f'Invalid JSON in {payload_path}: {exc}') from exc
    if not isinstance(payload, dict):
        raise click.ClickException('Payload root must be a JSON object.')
    return payload


def _parse_guid(value, label='GUID'):
    try:
        return uuid.UUID(str(value))
    except (TypeError, ValueError) as exc:
        raise click.ClickException(f'Invalid {label}: {value}') from exc


def _parse_date(value, default=None):
    if value is None or value == '':
        return default
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    text = str(value).strip()
    if not text:
        return default
    try:
        return date.fromisoformat(text[:10])
    except ValueError as exc:
        raise click.ClickException(f'Unable to parse date value: {value}') from exc


def _parse_decimal(value):
    if value is None or value == '':
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def _resolve_messageid(submission_documents):
    if not submission_documents:
        raise click.ClickException(
            'Payload has no submission_documents. Document import requires at least one.')

    message_ids = {doc.get('messageid') for doc in submission_documents}
    if None in message_ids or '' in message_ids:
        raise click.ClickException('Every submission_document must include a messageid.')
    if len(message_ids) != 1:
        raise click.ClickException(
            f'submission_documents must share a single messageid; found {sorted(message_ids)}.')
    return next(iter(message_ids))


def _resolve_mine(payload, mine_no_override):
    mine_no = mine_no_override or payload.get('mine_no')
    if not mine_no:
        raise click.ClickException(
            'No mine_no in payload. Pass --mine-no for an existing local mine.')
    mine = Mine.find_by_mine_no(mine_no)
    if not mine:
        raise click.ClickException(
            f'Local mine not found for mine_no={mine_no}. Create/seed the mine first, '
            'or pass --mine-no for a mine that exists locally.')
    return mine


def _notice_of_work_type_description(type_code):
    if not type_code:
        return None
    now_type = NOWApplicationType.query.filter_by(
        notice_of_work_type_code=type_code).one_or_none()
    return now_type.description if now_type else None


def _upsert_submission(messageid, mine, payload, force):
    submission = NOWSubmission.find_by_messageid(messageid)
    if submission and not force:
        raise click.ClickException(
            f'now_submissions.application already exists for messageid={messageid}. '
            'Re-run with --force to replace submission documents and refresh fields.')

    if not submission:
        submission = NOWSubmission(messageid=messageid)

    submission.mine_guid = mine.mine_guid
    submission.minenumber = mine.mine_no
    submission.status = submission.status or 'Under Review'
    submission.processed = 'Y'
    submission.originating_system = payload.get('originating_system') or submission.originating_system or 'VFCBC'
    submission.trackingnumber = payload.get('now_tracking_number') or submission.trackingnumber
    submission.typeofapplication = payload.get('type_of_application') or submission.typeofapplication
    submission.nameofproperty = payload.get('property_name') or submission.nameofproperty
    submission.latitude = _parse_decimal(payload.get('latitude')) or submission.latitude
    submission.longitude = _parse_decimal(payload.get('longitude')) or submission.longitude
    submission.noticeofworktype = (
        _notice_of_work_type_description(payload.get('notice_of_work_type_code'))
        or submission.noticeofworktype)

    submitted = _parse_date(payload.get('submitted_date'))
    received = _parse_date(payload.get('received_date'))
    if submitted:
        submission.submitteddate = datetime.combine(submitted, datetime.min.time())
    if received:
        submission.receiveddate = datetime.combine(received, datetime.min.time())

    db.session.add(submission)
    db.session.flush()
    return submission


def _replace_submission_documents(messageid, submission_documents):
    existing = NOWSubmissionDocument.query.filter_by(messageid=messageid).all()
    for doc in existing:
        db.session.delete(doc)
    db.session.flush()

    created = []
    for doc_data in submission_documents:
        filename = doc_data.get('filename')
        documenturl = doc_data.get('documenturl')
        if not filename or not documenturl:
            raise click.ClickException(
                'Each submission_document requires filename and documenturl.')
        doc = NOWSubmissionDocument(
            messageid=messageid,
            documenturl=documenturl,
            filename=filename,
            documenttype=doc_data.get('documenttype'),
            description=doc_data.get('description'),
        )
        db.session.add(doc)
        created.append(doc)
    db.session.flush()
    return created


def _create_minimal_now_application(payload):
    today = date.today()
    type_code = payload.get('notice_of_work_type_code')
    if not type_code:
        raise click.ClickException(
            'Payload is missing notice_of_work_type_code, required to create now_application.')

    application = NOWApplication(
        notice_of_work_type_code=type_code,
        now_application_status_code=payload.get('now_application_status_code') or 'REC',
        previous_application_status_code=payload.get('previous_application_status_code') or 'PEV',
        type_of_application=payload.get('type_of_application'),
        application_permit_type_code=payload.get('application_permit_type_code'),
        now_tracking_number=payload.get('now_tracking_number'),
        property_name=payload.get('property_name'),
        tenure_number=payload.get('tenure_number'),
        directions_to_site=payload.get('directions_to_site'),
        description_of_land=payload.get('description_of_land'),
        other_information=payload.get('other_information'),
        latitude=_parse_decimal(payload.get('latitude')),
        longitude=_parse_decimal(payload.get('longitude')),
        gate_latitude=_parse_decimal(payload.get('gate_latitude')),
        gate_longitude=_parse_decimal(payload.get('gate_longitude')),
        submitted_date=_parse_date(payload.get('submitted_date'), default=today),
        received_date=_parse_date(payload.get('received_date'), default=today),
        verified_by_user_date=_parse_date(payload.get('verified_by_user_date'), default=today),
        decision_by_user_date=_parse_date(payload.get('decision_by_user_date'), default=today),
        proposed_start_date=_parse_date(payload.get('proposed_start_date')),
        proposed_end_date=_parse_date(payload.get('proposed_end_date')),
        imported_by='cli-now-document-import',
        imported_date=datetime.utcnow(),
        security_not_required=True,
    )
    db.session.add(application)
    db.session.flush()
    return application


def _upsert_identity(now_guid, messageid, mine, payload, force):
    identity = NOWApplicationIdentity.find_by_guid(now_guid)
    identity_by_message = NOWApplicationIdentity.query.filter_by(messageid=messageid).one_or_none()

    if identity_by_message and (not identity
                                or identity_by_message.now_application_guid != now_guid):
        if not force:
            raise click.ClickException(
                f'messageid={messageid} is already linked to identity '
                f'{identity_by_message.now_application_guid}. Re-run with --force to reassign.')
        identity_by_message.messageid = None
        db.session.flush()

    if identity and not force:
        if identity.messageid or identity.now_application_id:
            raise click.ClickException(
                f'Identity {now_guid} already exists '
                f'(messageid={identity.messageid}, '
                f'now_application_id={identity.now_application_id}). '
                'Re-run with --force to overwrite.')

    if not identity:
        identity = NOWApplicationIdentity(now_application_guid=now_guid)
        db.session.add(identity)

    identity.messageid = messageid
    identity.mine_guid = mine.mine_guid
    identity.now_number = payload.get('now_number') or identity.now_number
    identity.application_type_code = payload.get('application_type_code') or 'NOW'
    identity.is_document_import_requested = False
    return identity


def setup_document_import(now_application_guid, payload_path, mine_no=None, force=False):
    _assert_safe_environment()
    now_guid = _parse_guid(now_application_guid, 'now_application_guid')
    payload = _load_payload(payload_path)
    submission_documents = payload.get('submission_documents') or []
    messageid = _resolve_messageid(submission_documents)
    mine = _resolve_mine(payload, mine_no)

    submission_exists = NOWSubmission.find_by_messageid(messageid) is not None
    _upsert_submission(messageid, mine, payload, force=force or not submission_exists)
    docs = _replace_submission_documents(messageid, submission_documents)
    identity = _upsert_identity(now_guid, messageid, mine, payload, force=force)

    if identity.now_application_id is None:
        application = _create_minimal_now_application(payload)
        identity.now_application_id = application.now_application_id
        db.session.flush()

    db.session.commit()

    click.echo('NOW document-import data is ready.')
    click.echo(f'  now_application_guid: {now_guid}')
    click.echo(f'  now_number:           {identity.now_number}')
    click.echo(f'  mine:                 {mine.mine_no} ({mine.mine_guid})')
    click.echo(f'  messageid:            {messageid}')
    click.echo(f'  submission_documents: {len(docs)}')
    click.echo(f'  now_application_id:   {identity.now_application_id}')
    click.echo(f'  import_requested:     {identity.is_document_import_requested}')
    click.echo(
        'Trigger import via UI save or '
        'POST /now-applications/{guid}/import-submission-documents-job. '
        'This command does not start the Document Manager job.')

def reset_document_import(now_application_guid, force=False):
    _assert_safe_environment()
    now_guid = _parse_guid(now_application_guid, 'now_application_guid')
    identity = NOWApplicationIdentity.find_by_guid(now_guid)
    if not identity:
        raise click.ClickException(f'No now_application_identity found for {now_guid}.')

    xrefs = []
    if identity.now_application_id is not None:
        xrefs = NOWApplicationDocumentIdentityXref.query.filter_by(
            now_application_id=identity.now_application_id).all()

    if not xrefs and not identity.is_document_import_requested and not force:
        click.echo(
            f'Nothing to reset for {now_guid} '
            '(import flag already false and no identity xrefs).')
        return

    deleted_xrefs = 0
    deleted_mine_docs = 0
    for xref in xrefs:
        mine_doc = xref.mine_document
        db.session.delete(xref)
        deleted_xrefs += 1
        if mine_doc is not None:
            # Hard-delete required: soft-deleted rows still collide on the composite PK
            # used by document-identity POST.
            db.session.delete(mine_doc)
            deleted_mine_docs += 1

    identity.is_document_import_requested = False
    db.session.commit()

    click.echo(f'Reset document-import state for {now_guid}.')
    click.echo(f'  is_document_import_requested: {identity.is_document_import_requested}')
    click.echo(f'  deleted identity xrefs:       {deleted_xrefs}')
    click.echo(f'  deleted mine_documents:       {deleted_mine_docs}')
    click.echo(
        'Note: Document Manager job history lives in a separate DB and is not cleared. '
        'Re-triggering import creates a new job (and cancels in-progress ones).')


@now_cli.command('setup-document-import')
@click.argument('now_application_guid')
@click.argument('payload_json', type=click.Path(exists=True))
@click.option('--mine-no', default=None, help='Override mine_no from payload (must exist locally).')
@click.option(
    '--force',
    is_flag=True,
    default=False,
    help='Overwrite existing submission/identity linkage for this GUID or messageid.',
)
def setup_document_import_command(now_application_guid, payload_json, mine_no, force):
    """Seed local NOW records needed to run a submission document import.

    PAYLOAD_JSON should be the response from test:
    GET /now-applications/{guid}?original=True
    """
    setup_document_import(now_application_guid, payload_json, mine_no=mine_no, force=force)


@now_cli.command('reset-document-import')
@click.argument('now_application_guid')
@click.option(
    '--force',
    is_flag=True,
    default=False,
    help='Run even when there is nothing obvious to reset.',
)
def reset_document_import_command(now_application_guid, force):
    """Clear Core document-import state so the full import can be re-run.

    Sets is_document_import_requested=false and hard-deletes
    now_application_document_identity_xref (+ linked mine_document) rows.
    Does not clear Document Manager job tables.
    """
    reset_document_import(now_application_guid, force=force)
