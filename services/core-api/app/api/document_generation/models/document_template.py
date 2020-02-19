import json
from datetime import datetime
from app.extensions import db
from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base


class DocumentTemplate(Base, AuditMixin):
    __tablename__ = 'document_template'
    document_template_code = db.Column(db.String, primary_key=True, server_default=FetchedValue())
    form_spec_json = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.String, nullable=False)

    @hybrid_property
    def form_spec(self):
        return json.loads(self.form_spec_json)

    def __repr__(self):
        return '<DocumentTemplate %r, %r>' % self.document_template_code
