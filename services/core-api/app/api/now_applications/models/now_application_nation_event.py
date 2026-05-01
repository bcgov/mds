from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


class NOWApplicationNationEvent(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_nation_event'

    now_application_nation_event_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    now_application_nation_event_id = db.Column(db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    now_application_nation_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('now_application_nation.now_application_nation_guid'), nullable=False)
    now_application_nation_event_code = db.Column(db.String(3), db.ForeignKey('now_application_nation_event_code.now_application_nation_event_code'), nullable=False)
    event_from = db.Column(db.String, nullable=False)
    event_to = db.Column(db.String, nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date)

    now_application_nation = db.relationship(
        "NOWApplicationNation",
        lazy="select",
        back_populates="now_application_nation_events"
    )

    event_code = db.relationship(
        "NOWApplicationNationEventCode",
        lazy="select"
    )

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.now_application_nation_event_guid}>'
    
    @classmethod
    def create(cls,
               now_application_nation_guid, 
               now_application_nation_event_code,
               event_from,
               event_to,
               start_date,
               end_date=None,
               add_to_session=True):
        
        now_application_nation_event = cls(
            now_application_nation_guid=now_application_nation_guid,
            now_application_nation_event_code=now_application_nation_event_code,
            event_from=event_from,
            event_to=event_to,
            start_date=start_date,
            end_date=end_date,
        )

        if add_to_session:
            now_application_nation_event.save(commit=False)

        return now_application_nation_event


    @classmethod
    def find_by_now_application_nation_guid(cls, now_application_nation_guid):
        return cls.query.filter_by(now_application_nation_guid=now_application_nation_guid, deleted_ind=False).order_by(cls.start_date).all()
    
    @classmethod
    def find_by_now_application_nation_event_guid(cls, now_application_nation_event_guid):
        return cls.query.filter_by(now_application_nation_event_guid=now_application_nation_event_guid, deleted_ind=False).one_or_none()
