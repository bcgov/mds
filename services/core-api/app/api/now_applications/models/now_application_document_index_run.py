from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID


def to_utc_isoformat(dt):
    """
    Serializes a naive UTC datetime (e.g. from datetime.utcnow()) with an explicit
    'Z' suffix so JS `new Date(...)` parses it as UTC instead of local time.
    """
    return f'{dt.isoformat()}Z' if dt else None


class NowApplicationDocumentIndexRun(AuditMixin, Base):
    __tablename__ = 'now_application_document_index_run'

    now_application_document_index_run_id = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=db.FetchedValue())

    now_application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'), nullable=False)

    status = db.Column(db.String(255), nullable=False)
    document_count = db.Column(db.Integer, nullable=False, server_default='0')
    items_processed = db.Column(db.Integer, nullable=False, server_default='0')
    error_count = db.Column(db.Integer, nullable=False, server_default='0')
    error_message = db.Column(db.String, nullable=True)

    last_run_start = db.Column(db.DateTime, nullable=False)
    last_run_end = db.Column(db.DateTime, nullable=True)

    # task_id for the core celery task responsible for polling permits and updating this row
    core_status_task_id = db.Column(db.String(255), nullable=True)

    now_application_identity = db.relationship(
        'NOWApplicationIdentity',
        lazy='select',
        backref=db.backref(
            'document_index_runs', lazy='select', order_by='NowApplicationDocumentIndexRun.create_timestamp.desc()'))

    @classmethod
    def get_latest_by_now_application_guid(cls, now_application_guid):
        return cls.query.filter_by(now_application_guid=now_application_guid) \
            .order_by(cls.create_timestamp.desc()).first()

    @classmethod
    def create(cls, **kwargs):
        obj = cls(**kwargs)
        db.session.add(obj)
        db.session.commit()
        return obj
