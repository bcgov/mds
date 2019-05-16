from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.utils.base_model import Base


class Inspection(Base):
    __tablename__ = "inspection"
    inspection_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    inspection_date = db.Column(db.DateTime)
    inspection_status_id = db.Column(db.Integer,
                                     db.ForeignKey('inspection_status.inspection_status_id'))
    inspection_status_code = association_proxy('inspection_status_code', 'inspection_status_id')
    business_area = db.Column(db.String)
    mine_no = db.Column(db.String)

    #inspection_document_xref = relationship("InspectionDocumentXref", secondary=lambda: userkeywords_table)

    #documents = relationship("InspectionDocuments", secondary=lambda: userkeywords_table)
    #documents = db.relationship('InspectionDocumentXref', lazy='select')

    def __repr__(self):
        return f'<inspection_id={self.inspection_status_code} inspection_status_description={self.inspection_status_description}>'
