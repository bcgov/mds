from app.api.utils.models_mixins import Base
from app.extensions import db
from sqlalchemy.schema import FetchedValue


class PIPConsultationArea(Base):
    __tablename__ = 'pip_consultation_area'

    # internal_mds_id is not part of the data given to us from PIP
    internal_mds_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    cnsltn_area_guid = db.Column(db.String, nullable=False)
    cnsltn_area_name = db.Column(db.String, nullable=False)
    organization_guid = db.Column(db.String, nullable=False)
    cnsltn_area_update_date = db.Column(db.DateTime, nullable=False)
    contact_organization_name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<PIPConsultationArea %r>' % self.internal_mds_id

    @classmethod
    def get_all(cls):
        return cls.query.order_by(cls.contact_organization_name).all()
