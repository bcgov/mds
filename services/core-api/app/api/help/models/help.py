from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

class Help(AuditMixin, Base):
    __tablename__ = "help"

    help_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    help_key = db.Column(db.String, nullable=False)
    system = db.Column(db.String, nullable=False)
    page_tab = db.Column(db.String, nullable=True)
    content = db.Column(db.String, nullable=True)
    is_draft = db.Column(db.Boolean, nullable=False, default=False)

    def delete(self, commit=True):
        super(Help, self).delete(commit)

    @staticmethod
    def get_all(system=None):
        if system is not None:
            return Help.query.filter_by(system=system).all()
        return Help.query.all()
    
    @staticmethod
    def find_by_help_key(help_key, system):
        return Help.query.filter_by(help_key=help_key, system=system).order_by(Help.update_timestamp.desc()).all()
    
    @staticmethod
    def find_by_help_guid(help_guid):
        return Help.query.filter_by(help_guid=help_guid).first()
    @staticmethod
    def create(help_key, content, system, page_tab = None, is_draft = False, add_to_session=True):
        help_guide = Help(help_key=help_key, system=system, page_tab=page_tab, content=content, is_draft=is_draft)
        if add_to_session:
            help_guide.save(commit=False)
        return help_guide