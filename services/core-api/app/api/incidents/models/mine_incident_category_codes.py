from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import Base


class MineIncidentCategoryCodes(Base):
    __tablename__ = 'mine_incident_category_codes'
    mine_incident_category_codes_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), nullable=False)
    mine_incident_category_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_category.mine_incident_category_code'),
        nullable=False)

    @classmethod
    def create(cls, mine_incident_category_code, mine_incident_id, add_to_session=True):
        new_category_code = cls(
            mine_incident_category_code=mine_incident_category_code,
            mine_incident_id=mine_incident_id)
        if add_to_session:
            new_category_code.save(commit=False)
        return new_category_code
