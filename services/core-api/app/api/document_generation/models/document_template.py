import json
from flask import current_app
from datetime import datetime
from app.extensions import db
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import mapper
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base


def get_model_by_model_name(model_name):
    # current_app.logger.info(mapper.__dict__.keys())
    for c in Base._decl_class_registry.values():
        if hasattr(c, '__name__') and c.__name__ == model_name:
            return c


class DocumentTemplate(Base, AuditMixin):
    __tablename__ = 'document_template'
    document_template_code = db.Column(db.String, primary_key=True, server_default=FetchedValue())
    form_spec_json = db.Column(db.String, nullable=False)
    source_model_name = db.Column(db.String, nullable=False)
    template_file_path = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.String, nullable=False, server_default=FetchedValue())

    context_primary_key = None

    @hybrid_property
    def form_spec(self):
        if self.context_primary_key:
            return self._form_spec_with_context(self.context_primary_key)
        return json.loads(self.form_spec_json)

    def _form_spec_with_context(self, primary_key):
        spec = json.loads(self.form_spec_json)

        current_app.logger.debug(f'getting model for string -> {self.source_model_name}')

        source_model = get_model_by_model_name(self.source_model_name)
        current_app.logger.debug(f'source_obj_model -> {source_model}')

        source_obj_instance = source_model.query.get(primary_key)
        current_app.logger.debug(f'source_obj_instance -> {source_obj_instance}')
        if not source_obj_instance:
            raise Exception("Context Object not found")

        for item in spec:
            relative_data_path = item.get('relative-data-path')
            if not relative_data_path:
                current_app.logger.debug(f'No relative-data-path for {item["id"]}')
                continue

            current_object = source_obj_instance
            for x in relative_data_path.split('.'):
                current_app.logger.debug(f'getting {current_object}.{x}')
                current_object = getattr(current_object, x)

            current_app.logger.info(
                f'Found data for form."{item["id"]}" at "{item["relative-data-path"]}" with -> "{current_object}"'
            )
            del item['relative-data-path']
            item["context-value"] = str(current_object)
        return spec

    def __repr__(self):
        return '<DocumentTemplate %r, %r>' % self.document_template_code
