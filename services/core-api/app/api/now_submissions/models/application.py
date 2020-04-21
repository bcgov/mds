import uuid
from werkzeug.exceptions import NotFound
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.extensions import db
from app.api.utils.models_mixins import Base
from app.api.now_submissions.models.client import Client
from app.api.now_submissions.models.contact import Contact
from app.api.now_submissions.models.document import Document
from app.api.now_submissions.models.placer_activity import PlacerActivity
from app.api.now_submissions.models.sand_grv_qry_activity import SandGrvQryActivity
from app.api.now_submissions.models.settling_pond import SettlingPondSubmission
from app.api.now_submissions.models.surface_bulk_sample_activity import SurfaceBulkSampleActivity
from app.api.now_submissions.models.under_exp_new_activity import UnderExpNewActivity
from app.api.now_submissions.models.under_exp_rehab_activity import UnderExpRehabActivity
from app.api.now_submissions.models.under_exp_surface_activity import UnderExpSurfaceActivity
from app.api.now_submissions.models.exp_access_activity import ExpAccessActivity
from app.api.now_submissions.models.exp_surface_drill_activity import ExpSurfaceDrillActivity
from app.api.now_submissions.models.water_source_activity import WaterSourceActivity
from app.api.now_submissions.models.mech_trenching_activity import MechTrenchingActivity

from app.api.now_submissions.models.existing_placer_activity_xref import ExistingPlacerActivityXref
from app.api.now_submissions.models.existing_settling_pond_xref import ExistingSettlingPondXref
from app.api.now_submissions.models.proposed_placer_activity_xref import ProposedPlacerActivityXref
from app.api.now_submissions.models.proposed_settling_pond_xref import ProposedSettlingPondXref

from app.api.constants import unit_type_map, type_of_permit_map, NOW_SUBMISSIONS_YES_NO, NOW_SUBMISSION_STATUS
from app.api.utils.field_template import FieldTemplate


class Application(Base):
    __tablename__ = "application"
    __table_args__ = {"schema": "now_submissions"}

    class _ModelSchema(Base._ModelSchema):
        application_guid = fields.String(dump_only=True)
        now_application_guid = fields.String(dump_only=True)
        mine_guid = fields.String(dump_only=True)
        sandgrvqrytotalmineresunits = fields.String(
            validate=validate.OneOf(choices=unit_type_map.keys()), allow_none=True)
        underexptotaloreunits = fields.String(
            validate=validate.OneOf(choices=unit_type_map.keys()), allow_none=True)
        underexptotalwasteunits = fields.String(
            validate=validate.OneOf(choices=unit_type_map.keys()), allow_none=True)
        sandgrvqryannualextrestunits = fields.String(
            validate=validate.OneOf(choices=unit_type_map.keys()), allow_none=True)
        typeofpermit = fields.String(
            validate=validate.OneOf(choices=type_of_permit_map.keys()), allow_none=True)
        landcommunitywatershed = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        archsitesaffected = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        fuellubstoreonsite = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        placerundergroundoperations = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        placerhandoperations = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        pondsexfiltratedtoground = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        pondsrecycled = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        pondsdischargedtoenv = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        bcexplosivespermitissued = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        storeexplosivesonsite = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        sandgrvqrywithinaglandres = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        sandgrvqrylocalgovsoilrembylaw = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        sandgrvqrygrdwtrexistingareas = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        sandgrvqrygrdwtrtestpits = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        sandgrvqrygrdwtrtestwells = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSIONS_YES_NO), allow_none=True)
        status = fields.String(
            validate=validate.OneOf(choices=NOW_SUBMISSION_STATUS), allow_none=True)

        noticeofworktype = FieldTemplate(
            field=fields.String, one_of='NOWApplicationType_description')

    messageid = db.Column(db.Integer, primary_key=True)
    now_application_identity = db.relationship(
        'NOWApplicationIdentity',
        lazy='joined',
        uselist=False,
        primaryjoin='Application.messageid==NOWApplicationIdentity.messageid',
        foreign_keys=messageid)
    application_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    now_application_guid = association_proxy('now_application_identity', 'now_application_guid')
    now_number = association_proxy('now_application_identity', 'now_number')
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    #mine_guid = association_proxy('now_application_identity', 'mine_guid')
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

    mine = db.relationship(
        'Mine',
        lazy='joined',
        uselist=False,
        primaryjoin='Mine.mine_guid==Application.mine_guid',
        foreign_keys=mine_guid)

    applicant = db.relationship(
        'Client', uselist=False, lazy='select', foreign_keys=[applicantclientid])
    submitter = db.relationship(
        'Client', uselist=False, lazy='select', foreign_keys=[submitterclientid])
    contacts = db.relationship('Contact', lazy='select')
    documents = db.relationship('Document', lazy='select')

    sand_grv_qry_activity = db.relationship('SandGrvQryActivity', lazy='select')
    surface_bulk_sample_activity = db.relationship('SurfaceBulkSampleActivity', lazy='select')
    under_exp_new_activity = db.relationship('UnderExpNewActivity', lazy='select')
    under_exp_rehab_activity = db.relationship('UnderExpRehabActivity', lazy='select')
    under_exp_surface_activity = db.relationship('UnderExpSurfaceActivity', lazy='select')
    water_source_activity = db.relationship('WaterSourceActivity', lazy='select')
    exp_access_activity = db.relationship('ExpAccessActivity', lazy='select')
    exp_surface_drill_activity = db.relationship('ExpSurfaceDrillActivity', lazy='select')
    mech_trenching_activity = db.relationship('MechTrenchingActivity', lazy='select')

    existing_placer_activity = db.relationship(
        'PlacerActivity', lazy='select', secondary='now_submissions.existing_placer_activity_xref')
    existing_settling_pond = db.relationship(
        'SettlingPondSubmission',
        lazy='select',
        secondary='now_submissions.existing_settling_pond_xref')
    proposed_placer_activity = db.relationship(
        'PlacerActivity', lazy='select', secondary='now_submissions.proposed_placer_activity_xref')
    proposed_settling_pond = db.relationship(
        'SettlingPondSubmission',
        lazy='select',
        secondary='now_submissions.proposed_settling_pond_xref')

    mech_trenching_equip = db.relationship(
        'EquipmentSubmission', lazy='select', secondary='now_submissions.mech_trenching_equip_xref')
    sand_grv_qry_equip = db.relationship(
        'EquipmentSubmission', lazy='select', secondary='now_submissions.sand_grv_qry_equip_xref')
    surface_bulk_sample_equip = db.relationship(
        'EquipmentSubmission',
        lazy='select',
        secondary='now_submissions.surface_bulk_sample_equip_xref')
    placer_equip = db.relationship(
        'EquipmentSubmission', lazy='select', secondary='now_submissions.placer_equip_xref')

    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')

    def __repr__(self):
        return '<Application %r>' % self.messageid

    @classmethod
    def find_by_now_application_guid(cls, now_application_guid):
        cls.validate_guid(now_application_guid)

        from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity

        now_identity = NOWApplicationIdentity.query.filter_by(
            now_application_guid=now_application_guid).first()
        if not now_identity:
            raise NotFound('Could not find a nros/vbcbc application for this id')
        return cls.find_by_messageid(now_identity.messageid)

    @classmethod
    def find_by_messageid(cls, messageid):
        return cls.query.filter_by(messageid=messageid).first()

    @classmethod
    def validate_guid(cls, now_application_guid, msg='Invalid guid.'):
        try:
            uuid.UUID(str(now_application_guid), version=4)
        except ValueError:
            raise AssertionError(msg)
