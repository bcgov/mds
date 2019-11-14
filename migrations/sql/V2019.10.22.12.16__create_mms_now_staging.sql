CREATE SCHEMA IF NOT EXISTS MMS_NOW_Submissions;

CREATE TABLE MMS_NOW_Submissions.application (
    ID serial PRIMARY KEY,
    APPLICATION_GUID uuid DEFAULT gen_random_uuid() NOT NULL,
    MESSAGEID integer,
    MMS_CID bigint UNIQUE,
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    NOTICEOFWORKTYPE character varying,
    TYPEOFPERMIT character varying,
    TYPEOFAPPLICATION character varying,
    MINENUMBER character varying,
    LATITUDE numeric(9,7),
    LONGITUDE numeric(11,7),
    NAMEOFPROPERTY character varying,
    TENURENUMBERS character varying,
    CROWNGRANTLOTNUMBERS character varying,
    SITEDIRECTIONS character varying,
    FIRSTAIDEQUIPMENTONSITE character varying,
    FIRSTAIDCERTLEVEL character varying,
    DESCEXPLORATIONPROGRAM character varying,
    PROPOSEDSTARTDATE date,
    PROPOSEDENDDATE date,
    YEARROUNDSEASONAL character varying,
    LANDCOMMUNITYWATERSHED character varying,
    LANDPRIVATE character varying,
    LANDLEGALDESC character varying,
    ARCHSITESAFFECTED character varying,
    BCEXPLOSIVESPERMITISSUED character varying,
    BCEXPLOSIVESPERMITNUMBER character varying,
    BCEXPLOSIVESPERMITEXPIRY date,
    CAMPDISTURBEDAREA numeric(14,2),
    CAMPTIMBERVOLUME numeric(14,2),
    BLDGDISTURBEDAREA numeric(14,2),
    BLDGTIMBERVOLUME numeric(14,2),
    STGEDISTURBEDAREA numeric(14,2),
    STGETIMBERVOLUME numeric(14,2),
    FUELLUBSTOREONSITE character varying,
    FUELLUBSTORED integer,
    FUELLUBSTOREMETHODBULK character varying,
    FUELLUBSTOREMETHODBARREL character varying,
    CBSFRECLAMATION character varying,
    CBSFRECLAMATIONCOST numeric(14,2),
    MECHTRENCHINGRECLAMATION character varying,
    MECHTRENCHINGRECLAMATIONCOST numeric(14,2),
    EXPSURFACEDRILLRECLAMATION character varying,
    EXPSURFACEDRILLRECLCORESTORAGE character varying,
    EXPSURFACEDRILLRECLAMATIONCOST numeric(14,2),
    EXPACCESSRECLAMATION character varying,
    EXPACCESSRECLAMATIONCOST numeric(14,2),
    SURFACEBULKSAMPLERECLAMATION character varying,
    SURFACEBULKSAMPLERECLSEPHANDL character varying,
    SURFACEBULKSAMPLERECLDRAINMITI character varying,
    SURFACEBULKSAMPLERECLCOST numeric(14,2),
    UNDEREXPRECLAMATION character varying,
    UNDEREXPRECLAMATIONCOST numeric(14,2),
    PLACERRECLAMATION character varying,
    PLACERRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYWITHINAGLANDRES character varying,
    SANDGRVQRYLOCALGOVSOILREMBYLAW character varying,
    SANDGRVQRYRECLAMATION character varying,
    SANDGRVQRYRECLAMATIONBACKFILL character varying,
    SANDGRVQRYRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYDISTURBEDAREA numeric(14,2),
    SANDGRVQRYTIMBERVOLUME numeric(14,2),
    SANDGRVQRYTOTALEXISTDISTAREA numeric(14,2),
    CUTLINESEXPLGRIDTOTALLINEKMS integer,
    CUTLINESEXPLGRIDTIMBERVOLUME numeric(14,2),
    CUTLINESRECLAMATION character varying,
    CUTLINESRECLAMATIONCOST numeric(14,2),
    FREEUSEPERMIT character varying,
    LICENCETOCUT character varying,
    TIMBERTOTALVOLUME numeric(14,2),
    EXISTINGPLACERTOTALDISTAREA numeric(14,2),
    PROPOSEDPLACERTOTALDISTAREA numeric(14,2),
    PROPOSEDPLACERTIMBERVOLUME numeric(14,2),
    UNDEREXPSURFACETOTALDISTAREA numeric(14,2),
    UNDEREXPSURFACETIMBERVOLUME numeric(14,2),
    CUTLINESEXPLGRIDDISTURBEDAREA numeric(14,2),
    PONDSRECYCLED character varying,
    PONDSEXFILTRATEDTOGROUND character varying,
    PONDSDISCHARGEDTOENV character varying,
    PONDSRECLAMATION character varying,
    PONDSRECLAMATIONCOST numeric(14,2),
    EXISTINGPONDSTOTALDISTAREA numeric(14,2),
    PROPOSEDPONDSTOTALDISTAREA numeric(14,2),
    PROPOSEDPONDSTIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.application OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.water_source_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
  MMS_CID bigint,
	SOURCEWATERSUPPLY character varying,
	TYPE character varying,
	USEOFWATER character varying,
	ESTIMATERATEWATER numeric(14,2),
	PUMPSIZEINWATER numeric(14,2),
	LOCATIONWATERINTAKE character varying,

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.water_source_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.placer_activity (
  PLACERACTIVITYID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	QUANTITY integer,
	DISTURBEDAREA numeric(14,2),
  TIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.placer_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.sand_grv_qry_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.sand_grv_qry_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.surface_bulk_sample_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.surface_bulk_sample_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_new_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	QUANTITY integer,
	
  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_new_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_rehab_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	QUANTITY integer,

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_rehab_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_surface_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	QUANTITY integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_surface_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.settling_pond (
  SETTLINGPONDID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.settling_pond OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.exp_access_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	LENGTH numeric(14,2),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.exp_access_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.exp_surface_drill_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.exp_surface_drill_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.mech_trenching_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
  MMS_CID bigint,
	TYPE character varying,
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.mech_trenching_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.contact (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
    MMS_CID bigint,
    ORG_LEGALNAME character varying,
    IND_FIRSTNAME character varying,
    IND_LASTNAME character varying,
    IND_PHONENUMBER character varying,
    DAYPHONENUMBER character varying,
    DAYPHONENUMBEREXT character varying,
    FAXNUMBER character varying,
    EMAIL character varying,
    ORG_CONTACTNAME character varying,
    MAILINGADDRESSLINE1 character varying,
    CONTACTTYPE character varying,
    MAILINGADDRESSCITY character varying,
    MAILINGADDRESSPROVSTATE character varying,
    MAILINGADDRESSPOSTALZIP character varying,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.contact OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.client (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
    MMS_CID bigint,
    ORG_LEGALNAME character varying,
    IND_FIRSTNAME character varying,
    IND_LASTNAME character varying,
    IND_PHONENUMBER character varying,
    DAYPHONENUMBER character varying,
    DAYPHONENUMBEREXT character varying,
    FAXNUMBER character varying,
    EMAIL character varying,
    ORG_CONTACTNAME character varying,
    MAILINGADDRESSLINE1 character varying,
    MAILINGADDRESSCITY character varying,
    MAILINGADDRESSPROVSTATE character varying,
    MAILINGADDRESSPOSTALZIP character varying,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.client OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.application_start_stop (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
    MMS_CID bigint,
    STARTWORKDATE date,
    ENDWORKDATE date
);

ALTER TABLE MMS_NOW_Submissions.application_start_stop OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.application_nda (
    MESSAGEID integer PRIMARY KEY,
    TRACKINGNUMBER integer,
    APPLICATIONTYPE character varying,
    STATUS character varying,
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    APPLICANTCLIENTID integer,
    SUBMITTERCLIENTID integer,
    TYPEDEEMEDAUTHORIZATION character varying,
    PERMITNUMBER character varying,
    MINENUMBER character varying,
    NOWNUMBER character varying,
    PLANACTIVITIESDRILLPROGRAM character varying,
    PLANACTIVITIESIPSURVEY character varying,
    PROPOSEDSTARTDATE date,
    PROPOSEDENDDATE date,
    TOTALLINEKILOMETERS integer,
    DESCPLANNEDACTIVITIES character varying,
    PROPOSEDNEWENDDATE date,
    REASONFOREXTENSION character varying,
    ANYOTHERINFORMATION character varying,
    VFCBCAPPLICATIONURL character varying

);

ALTER TABLE MMS_NOW_Submissions.application_nda OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.existing_placer_activity_xref (
    MMS_CID bigint,
	  PLACERACTIVITYID integer,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES MMS_NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.existing_placer_activity_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.existing_settling_pond_xref (
    MMS_CID bigint,
  	SETTLINGPONDID integer,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES MMS_NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.existing_settling_pond_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.proposed_placer_activity_xref (
    MMS_CID bigint,
  	PLACERACTIVITYID integer,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES MMS_NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.proposed_placer_activity_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.proposed_settling_pond_xref (
    MMS_CID bigint,
	  SETTLINGPONDID integer,

    FOREIGN KEY (MMS_CID) REFERENCES MMS_NOW_Submissions.application(MMS_CID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES MMS_NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.proposed_settling_pond_xref OWNER TO mds;