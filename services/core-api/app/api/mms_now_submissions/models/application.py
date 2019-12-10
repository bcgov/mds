import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from app.extensions import db
from app.api.utils.models_mixins import Base


class MMSApplication(Base):
    __tablename__ = "application"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer)
    mms_cid = db.Column(db.Integer)
    application_guid = db.Column(UUID(as_uuid=True), nullable=False)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    noticeofworktype = db.Column(db.String)
    typeofpermit = db.Column(db.String)
    typeofapplication = db.Column(db.String)
    minenumber = db.Column(db.String)
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    nameofproperty = db.Column(db.String)
    tenurenumbers = db.Column(db.String)
    crowngrantlotnumbers = db.Column(db.String)
    sitedirections = db.Column(db.String)
    firstaidequipmentonsite = db.Column(db.String)
    firstaidcertlevel = db.Column(db.String)
    descexplorationprogram = db.Column(db.String)
    proposedstartdate = db.Column(db.DateTime)
    proposedenddate = db.Column(db.DateTime)
    yearroundseasonal = db.Column(db.String)
    landcommunitywatershed = db.Column(db.String)
    landprivate = db.Column(db.String)
    landlegaldesc = db.Column(db.String)
    archsitesaffected = db.Column(db.String)
    bcexplosivespermitissued = db.Column(db.String)
    bcexplosivespermitnumber = db.Column(db.String)
    bcexplosivespermitexpiry = db.Column(db.DateTime)
    campdisturbedarea = db.Column(db.Numeric(14, 2))
    camptimbervolume = db.Column(db.Numeric(14, 2))
    bldgdisturbedarea = db.Column(db.Numeric(14, 2))
    bldgtimbervolume = db.Column(db.Numeric(14, 2))
    stgedisturbedarea = db.Column(db.Numeric(14, 2))
    stgetimbervolume = db.Column(db.Numeric(14, 2))
    fuellubstoreonsite = db.Column(db.String)
    fuellubstored = db.Column(db.Integer)
    fuellubstoremethodbulk = db.Column(db.String)
    fuellubstoremethodbarrel = db.Column(db.String)
    cbsfreclamation = db.Column(db.String)
    cbsfreclamationcost = db.Column(db.Numeric(14, 2))
    mechtrenchingreclamation = db.Column(db.String)
    mechtrenchingreclamationcost = db.Column(db.Numeric(14, 2))
    expsurfacedrillreclamation = db.Column(db.String)
    expsurfacedrillreclcorestorage = db.Column(db.String)
    expsurfacedrillreclamationcost = db.Column(db.Numeric(14, 2))
    expaccessreclamation = db.Column(db.String)
    expaccessreclamationcost = db.Column(db.Numeric(14, 2))
    surfacebulksamplereclamation = db.Column(db.String)
    surfacebulksamplereclsephandl = db.Column(db.String)
    surfacebulksamplerecldrainmiti = db.Column(db.String)
    surfacebulksamplereclcost = db.Column(db.Numeric(14, 2))
    underexpreclamation = db.Column(db.String)
    underexpreclamationcost = db.Column(db.Numeric(14, 2))
    placerreclamation = db.Column(db.String)
    placerreclamationcost = db.Column(db.Numeric(14, 2))
    sandgrvqrywithinaglandres = db.Column(db.String)
    sandgrvqrylocalgovsoilrembylaw = db.Column(db.String)
    sandgrvqryreclamation = db.Column(db.String)
    sandgrvqryreclamationbackfill = db.Column(db.String)
    sandgrvqryreclamationcost = db.Column(db.Numeric(14, 2))
    sandgrvqrytotalexistdistarea = db.Column(db.Numeric(14, 2))
    cutlinesexplgridtotallinekms = db.Column(db.Integer)
    cutlinesexplgridtimbervolume = db.Column(db.Numeric(14, 2))
    cutlinesreclamation = db.Column(db.String)
    cutlinesreclamationcost = db.Column(db.Numeric(14, 2))
    freeusepermit = db.Column(db.String)
    licencetocut = db.Column(db.String)
    timbertotalvolume = db.Column(db.Numeric(14, 2))
    existingplacertotaldistarea = db.Column(db.Numeric(14, 2))
    proposedplacertotaldistarea = db.Column(db.Numeric(14, 2))
    proposedplacertimbervolume = db.Column(db.Numeric(14, 2))
    underexpsurfacetotaldistarea = db.Column(db.Numeric(14, 2))
    underexpsurfacetimbervolume = db.Column(db.Numeric(14, 2))
    cutlinesexplgriddisturbedarea = db.Column(db.Numeric(14, 2))
    pondsrecycled = db.Column(db.String)
    pondsexfiltratedtoground = db.Column(db.String)
    pondsdischargedtoenv = db.Column(db.String)
    pondsreclamation = db.Column(db.String)
    pondsreclamationcost = db.Column(db.Numeric(14, 2))
    existingpondstotaldistarea = db.Column(db.Numeric(14, 2))
    proposedpondstotaldistarea = db.Column(db.Numeric(14, 2))
    proposedpondstimbervolume = db.Column(db.Numeric(14, 2))
    mmsnownumber = db.Column(db.String)

    sand_grv_qry_activity = db.relationship('MMSSandGrvQryActivity', lazy='select')
    surface_bulk_sample_activity = db.relationship('MMSSurfaceBulkSampleActivity', lazy='select')
    under_exp_new_activity = db.relationship('MMSUnderExpNewActivity', lazy='select')
    under_exp_rehab_activity = db.relationship('MMSUnderExpRehabActivity', lazy='select')
    under_exp_surface_activity = db.relationship('MMSUnderExpSurfaceActivity', lazy='select')
    water_source_activity = db.relationship('MMSWaterSourceActivity', lazy='select')
    exp_access_activity = db.relationship('MMSExpAccessActivity', lazy='select')
    exp_surface_drill_activity = db.relationship('MMSExpSurfaceDrillActivity', lazy='select')
    mech_trenching_activity = db.relationship('MMSMechTrenchingActivity', lazy='select')

    existing_placer_activity = db.relationship(
        'MMSPlacerActivity',
        lazy='select',
        secondary='mms_now_submissions.existing_placer_activity_xref')
    proposed_placer_activity = db.relationship(
        'MMSPlacerActivity',
        lazy='select',
        secondary='mms_now_submissions.proposed_placer_activity_xref')

    def __repr__(self):
        return '<MMSApplication %r>' % self.id

    @classmethod
    def find_by_mms_cid(cls, mms_cid):
        if not mms_cid:
            return
        return cls.query.filter_by(mms_cid=mms_cid).first()

    @classmethod
    def find_by_messageid(cls, messageid):
        return cls.query.filter_by(messageid=messageid).first()