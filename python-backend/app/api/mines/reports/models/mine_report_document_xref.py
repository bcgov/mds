from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineReportDocumentXref(Base):
    __tablename__ = "mine_report_document_xref"
    mine_report_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))
    mine_report_submission_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_submission.mine_report_submission_id'))

    def __repr__(self):
        return '<MineIncidentDocumentXref %r>' % self.mine_incident_document_xref_guid
