from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db

class NOWApplicationNation(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_nation'

    now_application_nation_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_application_nation_id = db.Column(db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    now_application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('now_application_identity.now_application_guid'), nullable=False)
    now_application_nation_status_code = db.Column(db.String(3), db.ForeignKey('now_application_nation_status.now_application_nation_status_code'), nullable=False)
    consultation_started_by_client = db.Column(db.Boolean, server_default=FetchedValue())
    due_date = db.Column(db.Date)
    contact_organization_name = db.Column(db.String, nullable=False)
    organization_guid = db.Column(db.String, nullable=False)
    consultation_area_name = db.Column(db.String, nullable=False)
    consultation_area_guid = db.Column(db.String, nullable=False)
    consultation_area_update_date = db.Column(db.DateTime, nullable=False)

    now_application_nation_events = db.relationship(
        "NOWApplicationNationEvent",
        lazy="select",
        back_populates="now_application_nation",
        order_by='NOWApplicationNationEvent.start_date'
    )

    now_application_nation_status = db.relationship(
        "NOWApplicationNationStatus",
        lazy="select"
    )

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.now_application_nation_guid}>'

    def delete(self, commit=True):
        events = getattr(self, "now_application_nation_events", [])
        for event in events:
            event.delete(commit=False)
        super(NOWApplicationNation, self).delete(commit)

    @classmethod
    def create(cls,
               now_application_guid,
               now_application_nation_status_code,
               due_date,
               contact_organization_name,
               organization_guid,
               consultation_area_name,
               consultation_area_guid,
               consultation_area_update_date,
               consultation_started_by_client=False,
               add_to_session=True):

        now_application_nation = cls(
            now_application_guid=now_application_guid,
            now_application_nation_status_code=now_application_nation_status_code,
            consultation_started_by_client=consultation_started_by_client,
            due_date=due_date,
            contact_organization_name=contact_organization_name,
            organization_guid=organization_guid,
            consultation_area_name=consultation_area_name,
            consultation_area_guid=consultation_area_guid,
            consultation_area_update_date=consultation_area_update_date,
        )

        if add_to_session:
            now_application_nation.save(commit=False)

        return now_application_nation

    @classmethod
    def find_by_now_application_guid(cls, now_application_guid):
        return cls.query.filter_by(now_application_guid=now_application_guid, deleted_ind=False).all()

    @classmethod
    def find_by_now_application_nation_guid(cls, now_application_nation_guid):
        return cls.query.filter_by(now_application_nation_guid=now_application_nation_guid, deleted_ind=False).one_or_none()
