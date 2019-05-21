from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base

from app.nris.models.inspection_status import InspectionStatus


class Inspection(Base):
    __tablename__ = "inspection"
    inspection_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    inspection_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    inspection_status_id = db.Column(db.Integer,
                                     db.ForeignKey('inspection_status.inspection_status_id'))
    inspection_status_code = association_proxy('inspection_status_code', 'inspection_status_code')
    business_area = db.Column(db.String(256))
    mine_no = db.Column(db.String(64))
    documents = db.relationship('Document', lazy='selectin', secondary='inspection_document_xref')
    inspector_idir = db.Column(db.String(256))
    inspection_introduction = db.Column(db.String())
    inspection_preamble = db.Column(db.String())
    inspection_closing = db.Column(db.String())
    officer_notes = db.Column(db.String())

    def __repr__(self):
        return f'<Inspection inspection_id={self.inspection_status_code} inspection_status_description={self.inspection_status_description}>'