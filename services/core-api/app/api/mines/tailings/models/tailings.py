from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.constants import MINESPACE_TSF_UPDATE_EMAIL
from app.api.services.email_service import EmailService
from app.config import Config


class MineTailingsStorageFacility(AuditMixin, Base):
    __tablename__ = "mine_tailings_storage_facility"
    mine_tailings_storage_facility_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine_tailings_storage_facility_name = db.Column(db.String(60), nullable=False)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    consequence_classification_status_code = db.Column(db.String)
    itrb_exemption_status_code = db.Column(db.String)
    tsf_operating_status_code = db.Column(db.String)
    notes = db.Column(db.String)
    engineer_of_records = db.relationship(
        'MinePartyAppointment',
        lazy='select',
        primaryjoin=
        'and_(MinePartyAppointment.mine_tailings_storage_facility_guid == MineTailingsStorageFacility.mine_tailings_storage_facility_guid, MinePartyAppointment.mine_party_appt_type_code == "EOR", MinePartyAppointment.deleted_ind == False)',
        order_by=
        'nullsfirst(desc(MinePartyAppointment.start_date)), nullsfirst(desc(MinePartyAppointment.end_date))'
    )

    @hybrid_property
    def engineer_of_record(self):
        if self.engineer_of_records:
            return self.engineer_of_records[0]

    def __repr__(self):
        return '<MineTailingsStorageFacility %r>' % self.mine_guid

    def json(self):
        return {
            'mine_tailings_storage_facility_guid': str(self.mine_tailings_storage_facility_guid),
            'mine_guid': str(self.mine_guid),
            'mine_tailings_storage_facility_name': str(self.mine_tailings_storage_facility_name)
        }

    @classmethod
    def create(cls,
               mine,
               mine_tailings_storage_facility_name,
               latitude,
               longitude,
               consequence_classification_status_code,
               itrb_exemption_status_code,
               tsf_operating_status_code,
               notes,
               add_to_session=True):
        new_tsf = cls(
            mine_tailings_storage_facility_name=mine_tailings_storage_facility_name,
            latitude=latitude,
            longitude=longitude,
            consequence_classification_status_code=consequence_classification_status_code,
            itrb_exemption_status_code=itrb_exemption_status_code,
            tsf_operating_status_code=tsf_operating_status_code,
            notes=notes)
        mine.mine_tailings_storage_facilities.append(new_tsf)
        if add_to_session:
            new_tsf.save()
        return new_tsf

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        return cls.query.filter_by(mine_guid=mine_guid).all()

    @classmethod
    def find_by_tsf_guid(cls, tsf_guid):
        return cls.query.filter_by(mine_tailings_storage_facility_guid=tsf_guid).first()

    @validates('mine_tailings_storage_facility_name')
    def validate_tsf_name(self, key, mine_tailings_storage_facility_name):
        if not mine_tailings_storage_facility_name:
            raise AssertionError('No tailings storage facility name provided.')
        if len(mine_tailings_storage_facility_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        #no duplicate TSF names on the same mine
        if (MineTailingsStorageFacility.query.filter_by(mine_guid=self.mine_guid).filter(
                MineTailingsStorageFacility.mine_tailings_storage_facility_guid !=
                self.mine_tailings_storage_facility_guid).filter_by(
                    mine_tailings_storage_facility_name=mine_tailings_storage_facility_name).first(
                    ) is not None):
            raise AssertionError(
                f'this mine already has a tailings storage facility named: "{mine_tailings_storage_facility_name}"'
            )
        return mine_tailings_storage_facility_name

    def send_email_tsf_update(self):
        recipients = MINESPACE_TSF_UPDATE_EMAIL
        subject = f'TSF Information Update for {self.mine.mine_name}'
        body = f'<p>{self.mine.mine_name} (Mine No.: {self.mine.mine_no}) has requested to update their TSF information.</p>'
        link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine.mine_guid}/reports/tailings'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)