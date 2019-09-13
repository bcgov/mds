import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from app.extensions import db
from app.api.utils.models_mixins import Base
from app.api.now_submissions.models.client import Client
from app.api.now_submissions.models.contact import Contact
from app.api.now_submissions.models.document import Document
from app.api.now_submissions.models.placer_activity import PlacerActivity
from app.api.now_submissions.models.sand_grv_qry_activity import SandGrvQryActivity
from app.api.now_submissions.models.settling_pond import SettlingPond
from app.api.now_submissions.models.surface_bulk_sample_activity import SurfaceBulkSampleActivity
from app.api.now_submissions.models.under_exp_new_activity import UnderExpNewActivity
from app.api.now_submissions.models.under_exp_rehab_activity import UnderExpRehabActivity
from app.api.now_submissions.models.under_exp_surface_activity import UnderExpSurfaceActivity
from app.api.now_submissions.models.exp_access_activity import ExpAccessActivity
from app.api.now_submissions.models.water_source_activity import WaterSourceActivity
from app.api.now_submissions.models.mech_trenching_activity import MechTrenchingActivity

from app.api.now_submissions.models.existing_placer_activity_xref import ExistingPlacerActivityXref
from app.api.now_submissions.models.existing_settling_pond_xref import ExistingSettlingPondXref
from app.api.now_submissions.models.proposed_placer_activity_xref import ProposedPlacerActivityXref
from app.api.now_submissions.models.proposed_settling_pond_xref import ProposedSettlingPondXref


class Application(Base):
    __tablename__ = "application"
    __table_args__ = {"schema": "now_submissions"}
    messageid = db.Column(db.Integer, primary_key=True)
    application_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    trackingnumber = db.Column(db.Integer)
    applicationtype = db.Column(db.String)
    status = db.Column(db.String)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    applicantclientid = db.Column(db.Integer, db.ForeignKey('now_submissions.client.clientid'))
    submitterclientid = db.Column(db.Integer, db.ForeignKey('now_submissions.client.clientid'))
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
    sandgravelquarryoperations = db.Column(db.String)
    storeexplosivesonsite = db.Column(db.String)
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
    surfacebulksampleprocmethods = db.Column(db.String)
    surfacebulksamplereclamation = db.Column(db.String)
    surfacebulksamplereclsephandl = db.Column(db.String)
    surfacebulksamplerecldrainmiti = db.Column(db.String)
    surfacebulksamplereclcost = db.Column(db.Numeric(14, 2))
    underexptotalore = db.Column(db.Integer)
    underexptotaloreunits = db.Column(db.String)
    underexptotalwaste = db.Column(db.Integer)
    underexptotalwasteunits = db.Column(db.String)
    underexpreclamation = db.Column(db.String)
    underexpreclamationcost = db.Column(db.Numeric(14, 2))
    placerundergroundoperations = db.Column(db.String)
    placerhandoperations = db.Column(db.String)
    placerreclamationarea = db.Column(db.Numeric(14, 2))
    placerreclamation = db.Column(db.String)
    placerreclamationcost = db.Column(db.Numeric(14, 2))
    sandgrvqrydepthoverburden = db.Column(db.Numeric(14, 2))
    sandgrvqrydepthtopsoil = db.Column(db.Numeric(14, 2))
    sandgrvqrystabilizemeasures = db.Column(db.String)
    sandgrvqrywithinaglandres = db.Column(db.String)
    sandgrvqryalrpermitnumber = db.Column(db.String)
    sandgrvqrylocalgovsoilrembylaw = db.Column(db.String)
    sandgrvqryofficialcommplan = db.Column(db.String)
    sandgrvqrylandusezoning = db.Column(db.String)
    sandgrvqryendlanduse = db.Column(db.String)
    sandgrvqrytotalmineres = db.Column(db.Integer)
    sandgrvqrytotalmineresunits = db.Column(db.String)
    sandgrvqryannualextrest = db.Column(db.Integer)
    sandgrvqryannualextrestunits = db.Column(db.String)
    sandgrvqryreclamation = db.Column(db.String)
    sandgrvqryreclamationbackfill = db.Column(db.String)
    sandgrvqryreclamationcost = db.Column(db.Numeric(14, 2))
    sandgrvqrygrdwtravgdepth = db.Column(db.Numeric(14, 1))
    sandgrvqrygrdwtrexistingareas = db.Column(db.String)
    sandgrvqrygrdwtrtestpits = db.Column(db.String)
    sandgrvqrygrdwtrtestwells = db.Column(db.String)
    sandgrvqrygrdwtrother = db.Column(db.String)
    sandgrvqrygrdwtrmeasprotect = db.Column(db.String)
    sandgrvqryimpactdistres = db.Column(db.Integer)
    sandgrvqryimpactdistwater = db.Column(db.Integer)
    sandgrvqryimpactnoise = db.Column(db.String)
    sandgrvqryimpactprvtaccess = db.Column(db.String)
    sandgrvqryimpactprevtdust = db.Column(db.String)
    sandgrvqryimpactminvisual = db.Column(db.String)
    cutlinesexplgridtotallinekms = db.Column(db.Integer)
    cutlinesexplgridtimbervolume = db.Column(db.Numeric(14, 2))
    cutlinesreclamation = db.Column(db.String)
    cutlinesreclamationcost = db.Column(db.Numeric(14, 2))
    pondswastewatertreatfacility = db.Column(db.String)
    freeusepermit = db.Column(db.String)
    licencetocut = db.Column(db.String)
    timbertotalvolume = db.Column(db.Numeric(14, 2))
    campbuildstgetotaldistarea = db.Column(db.Numeric(14, 2))
    mechtrenchingtotaldistarea = db.Column(db.Numeric(14, 2))
    expsurfacedrilltotaldistarea = db.Column(db.Numeric(14, 2))
    expaccesstotaldistarea = db.Column(db.Numeric(14, 2))
    surfacebulksampletotaldistarea = db.Column(db.Numeric(14, 2))
    placertotaldistarea = db.Column(db.Numeric(14, 2))
    underexptotaldistarea = db.Column(db.Numeric(14, 2))
    sandgrvqrytotaldistarea = db.Column(db.Numeric(14, 2))
    pondstotaldistarea = db.Column(db.Numeric(14, 2))
    reclcostsubtotal = db.Column(db.Numeric(14, 2))
    reclcostexist = db.Column(db.Numeric(14, 2))
    reclcostrecl = db.Column(db.Numeric(14, 2))
    reclcosttotal = db.Column(db.Numeric(14, 2))
    reclareasubtotal = db.Column(db.Numeric(14, 2))
    reclareaexist = db.Column(db.Numeric(14, 2))
    reclarearecl = db.Column(db.Numeric(14, 2))
    reclareatotal = db.Column(db.Numeric(14, 2))
    anyotherinformation = db.Column(db.String)
    vfcbcapplicationurl = db.Column(db.String)
    messagecreateddate = db.Column(db.DateTime)
    processed = db.Column(db.String)
    processeddate = db.Column(db.DateTime)
    cutlinesexplgriddisturbedarea = db.Column(db.Numeric(14, 2))
    pondsrecycled = db.Column(db.String)
    pondsexfiltratedtoground = db.Column(db.String)
    pondsdischargedtoenv = db.Column(db.String)
    pondsreclamation = db.Column(db.String)
    pondsreclamationcost = db.Column(db.Numeric(14, 2))
    sandgrvqrytotalexistdistarea = db.Column(db.Numeric(14, 2))
    nrsosapplicationid = db.Column(db.String)
    isblastselect = db.Column(db.String)
    istimberselect = db.Column(db.String)
    originating_system = db.Column(db.String)

    mine = db.relationship('Mine', lazy='joined')

    applicant = db.relationship('Client', lazy='joined', foreign_keys=[applicantclientid])
    submitter = db.relationship('Client', lazy='joined', foreign_keys=[submitterclientid])
    contacts = db.relationship('Contact', lazy='joined')
    documents = db.relationship('Document', lazy='joined')
    sand_grv_qry_activity = db.relationship('SandGrvQryActivity', lazy='joined')
    surface_bulk_sample_activity = db.relationship('SurfaceBulkSampleActivity', lazy='joined')
    under_exp_new_activity = db.relationship('UnderExpNewActivity', lazy='joined')
    under_exp_rehab_activity = db.relationship('UnderExpRehabActivity', lazy='joined')
    under_exp_surface_activity = db.relationship('UnderExpSurfaceActivity', lazy='joined')
    water_source_activity = db.relationship('WaterSourceActivity', lazy='joined')
    exp_access_activity = db.relationship('ExpAccessActivity', lazy='joined')
    mech_trenching_activity = db.relationship('MechTrenchingActivity', lazy='joined')

    existing_placer_activity = db.relationship(
        'PlacerActivity', lazy='joined', secondary='now_submissions.existing_placer_activity_xref')
    existing_settling_pond = db.relationship(
        'SettlingPond', lazy='joined', secondary='now_submissions.existing_settling_pond_xref')
    proposed_placer_activity = db.relationship(
        'PlacerActivity', lazy='joined', secondary='now_submissions.proposed_placer_activity_xref')
    proposed_settling_pond = db.relationship(
        'SettlingPond', lazy='joined', secondary='now_submissions.proposed_settling_pond_xref')

    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')

    def __repr__(self):
        return '<Application %r>' % self.messageid

    @classmethod
    def find_by_application_guid(cls, guid):
        cls.validate_guid(guid)
        return cls.query.filter_by(application_guid=guid).first()

    @classmethod
    def validate_guid(cls, guid, msg='Invalid guid.'):
        try:
            uuid.UUID(str(guid), version=4)
        except ValueError:
            raise AssertionError(msg)
