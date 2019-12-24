from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import Base


class MineIncidentCategoryXref(Base):
    __tablename__ = 'mine_incident_category_xref'
    mine_incident_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_incident.mine_incident_id'),
        primary_key=True,
        nullable=False)
    mine_incident_category_code = db.Column(
        db.String(3),
        db.ForeignKey('mine_incident_category.mine_incident_category_code'),
        primary_key=True,
        nullable=False)

    @classmethod
    def create_batch(cls, mine_incident_id, mine_incident_category_codes, add_to_session=True):
        if mine_incident_category_codes is not None:
            mine_incident_category_codes.sort()
            for mine_incident_category_code in mine_incident_category_codes:
                if mine_incident_category_code is None:
                    continue
                new_mine_incident_category_code = MineIncidentCategoryXref.create(
                    mine_incident_id, mine_incident_category_code, add_to_session)
                new_mine_incident_category_code.save()

    @classmethod
    def create(cls, mine_incident_id, mine_incident_category_code, add_to_session=True):
        new_mine_incident_category_code = cls(
            mine_incident_id=mine_incident_id,
            mine_incident_category_code=mine_incident_category_code)
        if add_to_session:
            new_mine_incident_category_code.save(commit=False)
        return new_mine_incident_category_code

    @classmethod
    def delete(cls, mine_incident_id):
        cls.query.filter_by(mine_incident_id=mine_incident_id).delete()
        db.session.commit()