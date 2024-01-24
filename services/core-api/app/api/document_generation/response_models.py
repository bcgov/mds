from app.extensions import api

from flask_restx import fields

DOCUMENT_TEMPLATE_FIELD_MODEL = api.model(
    'DocumentTemplateFieldModel', {
        'id': fields.String,
        'label': fields.String,
        'type': fields.String,
        'placeholder': fields.String,
        'required': fields.Boolean(default=False),
        'context-value': fields.String,
        'read-only': fields.Boolean(default=False)
    })

DOCUMENT_TEMPLATE_MODEL = api.model(
    'DocumentTemplateModel', {
        'document_template_code': fields.String,
        'form_spec': fields.List(fields.Nested(DOCUMENT_TEMPLATE_FIELD_MODEL, skip_none=True))
    })
