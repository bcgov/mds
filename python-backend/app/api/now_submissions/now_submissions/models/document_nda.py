from ....utils.models_mixins import Base
from app.extensions import db


class NOWDocumentNDA(Base):
    __tablename__ = "document_nda"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer)
    documenturl = db.Column(db.String)
    filename = db.Column(db.String)
    documenttype = db.Column(db.String)
    description = db.Column(db.String)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application_nda(MESSAGEID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWDocumentNDA %r>' % self.id
