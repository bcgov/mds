from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from flask import current_app
from flask_restplus import marshal
from app.api.mines.response_models import PERMIT_CONDITION_MODEL
import json


class NOWApplicationDocumentType(AuditMixin, Base):
    __tablename__ = 'now_application_document_type'
    now_application_document_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    document_template_code = db.Column(db.String,
                                       db.ForeignKey('document_template.document_template_code'))
    document_template = db.relationship('DocumentTemplate', backref='now_application_document_type')

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def get_with_context(cls, document_type_code, context_guid):
        document_type = cls.query.get(document_type_code)
        if context_guid:
            document_type.document_template.context_primary_key = context_guid
        return document_type

    def transform_template_data(self, template_data, now_application):

        # Transform template data for "Working Permit for Amendment" documents
        if self.now_application_document_type_code == 'PMA':
            return self.transform_pma(template_data, now_application)
        return template_data

    def transform_pma(self, template_data, now_application):
        current_app.logger.info(f'***transform_pma***')

        if not now_application.draft_permit:
            raise Exception(f'Notice of Work has no draft permit')

        current_app.logger.info(f'now_application.draft_permit:\n{now_application.draft_permit}')
        current_app.logger.info(
            f'now_application.draft_permit.conditions:\n{json.dumps(marshal(now_application.draft_permit.conditions, PERMIT_CONDITION_MODEL))}'
        )

        return template_data