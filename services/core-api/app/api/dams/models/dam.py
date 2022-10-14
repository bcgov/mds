from enum import Enum

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class ConsequenceClassification(Enum):
    LOW = "LOW",
    HIG = 'HIG',
    SIG = 'SIG',
    VHIG = 'VHIG',
    EXT = 'EXT',
    NRT = 'NRT'

    def __str__(self):
        return self.value


class DamType(Enum):
    dam = 'dam',

    def __str__(self):
        return self.value


class OperatingStatus(Enum):
    construction = 'construction',
    operation = 'operation',
    care_and_maintenance = 'care_and_maintenance',
    closure_transition = 'closure_transition',
    closure_active_care = 'closure_active_care',
    closure_passive_care = 'closure_passive_care'

    def __str__(self):
        return self.value


class Dam(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "dam"

    dam_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_tailings_storage_facility_guid = db.Column(UUID(as_uuid=True), db.ForeignKey(
        'mine_tailings_storage_facility.mine_tailings_storage_facility_guid'))
    dam_type = db.Column(db.Enum(DamType), nullable=False)
    dam_name = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Numeric(9, 7), nullable=False)
    longitude = db.Column(db.Numeric(11, 7), nullable=False)
    operating_status = db.Column(db.Enum(OperatingStatus), nullable=False)
    consequence_classification = db.Column(db.Enum(ConsequenceClassification), nullable=False)
    permitted_dam_crest_elevation = db.Column(db.Numeric(10, 2), nullable=False)
    current_dam_height = db.Column(db.Numeric(10, 2), nullable=False)
    current_elevation = db.Column(db.Numeric(10, 2), nullable=False)
    max_pond_elevation = db.Column(db.Numeric(10, 2), nullable=False)
    min_freeboard_required = db.Column(db.Numeric(10, 2), nullable=False)

    @classmethod
    def create(cls,
               tailings_storage_facility,
               dam_type,
               dam_name,
               latitude,
               longitude,
               operating_status,
               consequence_classification,
               permitted_dam_crest_elevation,
               current_dam_height,
               current_elevation,
               max_pond_elevation,
               min_freeboard_required,
               add_to_session=True):
        new_dam = cls(
            mine_tailings_storage_facility_guid=tailings_storage_facility.mine_tailings_storage_facility_guid,
            dam_type=dam_type,
            dam_name=dam_name,
            latitude=latitude,
            longitude=longitude,
            operating_status=operating_status,
            consequence_classification=consequence_classification,
            permitted_dam_crest_elevation=permitted_dam_crest_elevation,
            current_dam_height=current_dam_height,
            current_elevation=current_elevation,
            max_pond_elevation=max_pond_elevation,
            min_freeboard_required=min_freeboard_required,
        )
        tailings_storage_facility.dams.append(new_dam)

        if add_to_session:
            new_dam.save()

        return new_dam

    @classmethod
    def find_all(cls,
                 tsf_guid=None):
        query = cls.query.filter_by(deleted_ind=False)
        if tsf_guid:
            query = query.filter_by(mine_tailings_storage_facility_guid=tsf_guid).order_by(cls.update_timestamp.desc())
        result = query.all()
        return dict([('total', len(result)), ('records', result)])

    @classmethod
    def find_one(cls, __guid):
        query = cls.query.filter_by(dam_guid=__guid)
        return query.first()

    def update(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        self.save()
