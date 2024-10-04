from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.schema import FetchedValue

class Help(AuditMixin, Base):
    __tablename__ = "help"

    help_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    help_key = db.Column(db.String, nullable=False)
    help_key_params = db.Column(JSONB(astext_type=db.Text()), nullable=True)
    content = db.Column(db.String, nullable=True)
    is_draft = db.Column(db.Boolean, nullable=False, default=False)

    def delete(self, commit=True):
        super(Help, self).delete(commit)

    @staticmethod
    def find_by_help_key(help_key):
        return Help.query.filter_by(help_key=help_key).order_by(Help.update_timestamp.desc())
    
    @staticmethod
    def create(help_key, content, help_key_params = None, is_draft = False, add_to_session=True):
        help_guide = Help(help_key=help_key, help_key_params=help_key_params, content=content, is_draft=is_draft)
        if add_to_session:
            help_guide.save(commit=False)
        return help_guide