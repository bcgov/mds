CREATE SCHEMA IF NOT EXISTS MMS_NOW_Submissions;

CREATE TABLE MMS_NOW_Submissions.application (
    MESSAGEID integer PRIMARY KEY,
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    NOTICEOFWORKTYPE character varying(300),
    TYPEOFPERMIT character varying(300),
    TYPEOFAPPLICATION character varying(300),
    MINENUMBER character varying(300),
    LATITUDE numeric(9,7),
    LONGITUDE numeric(11,7),
    NAMEOFPROPERTY character varying(4000),
    TENURENUMBERS character varying(4000),
    CROWNGRANTLOTNUMBERS character varying(4000),
    SITEDIRECTIONS character varying(4000),
    FIRSTAIDEQUIPMENTONSITE character varying(4000),
    FIRSTAIDCERTLEVEL character varying(300),
    DESCEXPLORATIONPROGRAM character varying(4000),
    PROPOSEDSTARTDATE date,
    PROPOSEDENDDATE date,
    YEARROUNDSEASONAL character varying(300),
    LANDCOMMUNITYWATERSHED character varying(3),
    LANDPRIVATE character varying(3),
    LANDLEGALDESC character varying(4000),
    ARCHSITESAFFECTED character varying(3),
    BCEXPLOSIVESPERMITISSUED character varying(3),
    BCEXPLOSIVESPERMITNUMBER character varying(300),
    BCEXPLOSIVESPERMITEXPIRY date,
    CAMPDISTURBEDAREA numeric(14,2),
    CAMPTIMBERVOLUME numeric(14,2),
    BLDGDISTURBEDAREA numeric(14,2),
    BLDGTIMBERVOLUME numeric(14,2),
    STGEDISTURBEDAREA numeric(14,2),
    STGETIMBERVOLUME numeric(14,2),
    FUELLUBSTOREONSITE character varying(3),
    FUELLUBSTORED integer,
    FUELLUBSTOREMETHODBULK character varying(3),
    FUELLUBSTOREMETHODBARREL character varying(3),
    CBSFRECLAMATION character varying(4000),
    CBSFRECLAMATIONCOST numeric(14,2),
    MECHTRENCHINGRECLAMATION character varying(4000),
    MECHTRENCHINGRECLAMATIONCOST numeric(14,2),
    EXPSURFACEDRILLRECLAMATION character varying(4000),
    EXPSURFACEDRILLRECLCORESTORAGE character varying(4000),
    EXPSURFACEDRILLRECLAMATIONCOST numeric(14,2),
    EXPACCESSRECLAMATION character varying(4000),
    EXPACCESSRECLAMATIONCOST numeric(14,2),
    SURFACEBULKSAMPLERECLAMATION character varying(4000),
    SURFACEBULKSAMPLERECLSEPHANDL character varying(4000),
    SURFACEBULKSAMPLERECLDRAINMITI character varying(4000),
    SURFACEBULKSAMPLERECLCOST numeric(14,2),
    UNDEREXPRECLAMATION character varying(4000),
    UNDEREXPRECLAMATIONCOST numeric(14,2),
    PLACERRECLAMATION character varying(4000),
    PLACERRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYWITHINAGLANDRES character varying(3),
    SANDGRVQRYLOCALGOVSOILREMBYLAW character varying(3),
    SANDGRVQRYRECLAMATION character varying(4000),
    SANDGRVQRYRECLAMATIONBACKFILL character varying(4000),
    SANDGRVQRYRECLAMATIONCOST numeric(14,2),
    CUTLINESEXPLGRIDTOTALLINEKMS integer,
    CUTLINESEXPLGRIDTIMBERVOLUME numeric(14,2),
    CUTLINESRECLAMATION character varying(4000),
    CUTLINESRECLAMATIONCOST numeric(14,2),
    FREEUSEPERMIT character varying(3),
    LICENCETOCUT character varying(3),
    TIMBERTOTALVOLUME numeric(14,2),
    PLACERTOTALDISTAREA numeric(14,2),
    SANDGRVQRYTOTALDISTAREA numeric(14,2),
    CUTLINESEXPLGRIDDISTURBEDAREA numeric(14,2),
    PONDSRECYCLED character varying(3),
    PONDSEXFILTRATEDTOGROUND character varying(3),
    PONDSDISCHARGEDTOENV character varying(3),
    PONDSRECLAMATION character varying(4000),
    PONDSRECLAMATIONCOST numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.application OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.water_source_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
	SOURCEWATERSUPPLY character varying(4000),
	TYPE character varying(4000),
	USEOFWATER character varying(4000),
	ESTIMATERATEWATER numeric(14,2),
	PUMPSIZEINWATER numeric(14,2),
	LOCATIONWATERINTAKE character varying(4000),

  FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.water_source_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.placer_activity (
  PLACERACTIVITYID integer PRIMARY KEY,
	TYPE character varying(4000),
	QUANTITY integer,
	DISTURBEDAREA numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.placer_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.sand_grv_qry_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.sand_grv_qry_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.surface_bulk_sample_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
	TYPE character varying(4000),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.surface_bulk_sample_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_new_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	QUANTITY integer,
	
  FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_new_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_rehab_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	QUANTITY integer,

  FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_rehab_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.under_exp_surface_activity (
  ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	QUANTITY integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.under_exp_surface_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.settling_pond (
  SETTLINGPONDID integer PRIMARY KEY,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

ALTER TABLE MMS_NOW_Submissions.settling_pond OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.exp_access_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
	TYPE character varying(4000),
	LENGTH numeric(14,2),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.exp_access_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.exp_surface_drill_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
	TYPE character varying(4000),
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.exp_surface_drill_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.mech_trenching_activity (
  ID serial PRIMARY KEY,
  MESSAGEID integer,
	TYPE character varying(4000),
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

  FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.mech_trenching_activity OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.contact (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
    ORG_LEGALNAME character varying(250),
    IND_FIRSTNAME character varying(60),
    IND_LASTNAME character varying(60),
    IND_PHONENUMBER character varying(10),
    DAYPHONENUMBER character varying(10),
    DAYPHONENUMBEREXT character varying(4),
    FAXNUMBER character varying(10),
    EMAIL character varying(60),
    ORG_CONTACTNAME character varying(4000),
    MAILINGADDRESSLINE1 character varying(4000),
    CONTACTTYPE character varying(4000),
    MAILINGADDRESSCITY character varying(100),
    MAILINGADDRESSPROVSTATE character varying(200),
    MAILINGADDRESSPOSTALZIP character varying(10),

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.contact OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.application_start_stop (
    MESSAGEID integer PRIMARY KEY,
    STARTWORKDATE date,
    ENDWORKDATE date
);

ALTER TABLE MMS_NOW_Submissions.application_start_stop OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.application_nda (
    MESSAGEID integer PRIMARY KEY,
    TRACKINGNUMBER integer,
    APPLICATIONTYPE character varying(100),
    STATUS character varying(60),
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    APPLICANTCLIENTID integer,
    SUBMITTERCLIENTID integer,
    TYPEDEEMEDAUTHORIZATION character varying(50),
    PERMITNUMBER character varying(50),
    MINENUMBER character varying(50),
    NOWNUMBER character varying(50),
    PLANACTIVITIESDRILLPROGRAM character varying(3),
    PLANACTIVITIESIPSURVEY character varying(3),
    PROPOSEDSTARTDATE date,
    PROPOSEDENDDATE date,
    TOTALLINEKILOMETERS integer,
    DESCPLANNEDACTIVITIES character varying(4000),
    PROPOSEDNEWENDDATE date,
    REASONFOREXTENSION character varying(4000),
    ANYOTHERINFORMATION character varying(4000),
    VFCBCAPPLICATIONURL character varying(4000)

);

ALTER TABLE MMS_NOW_Submissions.application_nda OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.existing_placer_activity_xref (
    MESSAGEID integer,
	  PLACERACTIVITYID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES MMS_NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.existing_placer_activity_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.existing_settling_pond_xref (
    MESSAGEID integer,
	  SETTLINGPONDID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES MMS_NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.existing_settling_pond_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.proposed_placer_activity_xref (
    MESSAGEID integer,
	  PLACERACTIVITYID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES MMS_NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.proposed_placer_activity_xref OWNER TO mds;

CREATE TABLE MMS_NOW_Submissions.proposed_settling_pond_xref (
    MESSAGEID integer,
	  SETTLINGPONDID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES MMS_NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES MMS_NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE MMS_NOW_Submissions.proposed_settling_pond_xref OWNER TO mds;
