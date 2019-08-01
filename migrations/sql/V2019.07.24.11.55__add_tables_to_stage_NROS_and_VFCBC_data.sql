CREATE SCHEMA IF NOT EXISTS NOW_Submissions;

CREATE TABLE NOW_Submissions.application_start_stop (
    MESSAGEID integer PRIMARY KEY,
    NRSOSAPPLICATIONID character varying(50),
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    NOWNUMBER character varying(50),
    STARTWORKDATE date,
    ENDWORKDATE date,
    PROCESSED character varying(1),
    PROCESSEDDATE date
);

CREATE TABLE NOW_Submissions.client (
    CLIENTID integer PRIMARY KEY,
    TYPE character varying(30),
    ORG_LEGALNAME character varying(250),
    ORG_DOINGBUSINESSAS character varying(150),
    IND_FIRSTNAME character varying(60),
    IND_LASTNAME character varying(60),
    IND_MIDDLENAME character varying(60),
    IND_PHONENUMBER character varying(10),
    DAYPHONENUMBER character varying(10),
    DAYPHONENUMBEREXT character varying(4),
    FAXNUMBER character varying(10),
    EMAIL character varying(60),
    ORG_BCFEDINCORPNUMBER character varying(30),
    ORG_BCREGNUMBER character varying(10),
    ORG_SOCIETYNUMBER character varying(30),
    ORG_HSTREGNUMBER character varying(30),
    ORG_CONTACTNAME character varying(4000),
    MAILINGADDRESSLINE1 character varying(4000),
    MAILINGADDRESSLINE2 character varying(60),
    MAILINGADDRESSCITY character varying(100),
    MAILINGADDRESSPROVSTATE character varying(200),
    MAILINGADDRESSCOUNTRY character varying(50),
    MAILINGADDRESSPOSTALZIP character varying(10)
);

CREATE TABLE NOW_Submissions.application_nda (
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
    VFCBCAPPLICATIONURL character varying(4000),
    MESSAGECREATEDDATE date,
    PROCESSED character varying(1),
    PROCESSEDDATE date,
    NRSOSAPPLICATIONID character varying(50),

    FOREIGN KEY (APPLICANTCLIENTID) REFERENCES NOW_Submissions.client(CLIENTID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SUBMITTERCLIENTID) REFERENCES NOW_Submissions.client(CLIENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.equipment(
    EQUIPMENTID integer PRIMARY KEY,
	TYPE character varying(4000),
	SIZECAPACITY character varying(4000),
	QUANTITY integer
);

CREATE TABLE NOW_Submissions.application (
    MESSAGEID integer PRIMARY KEY,
    TRACKINGNUMBER integer,
    APPLICATIONTYPE character varying(100),
    STATUS character varying(60),
    SUBMITTEDDATE date,
    RECEIVEDDATE date,
    APPLICANTCLIENTID integer,
    SUBMITTERCLIENTID integer,
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
    SANDGRAVELQUARRYOPERATIONS character varying(3),
    STOREEXPLOSIVESONSITE character varying(3),
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
    SURFACEBULKSAMPLEPROCMETHODS character varying(4000),
    SURFACEBULKSAMPLERECLAMATION character varying(4000),
    SURFACEBULKSAMPLERECLSEPHANDL character varying(4000),
    SURFACEBULKSAMPLERECLDRAINMITI character varying(4000),
    SURFACEBULKSAMPLERECLCOST numeric(14,2),
    UNDEREXPTOTALORE integer,
    UNDEREXPTOTALOREUNITS character varying(20),
    UNDEREXPTOTALWASTE integer,
    UNDEREXPTOTALWASTEUNITS character varying(20),
    UNDEREXPRECLAMATION character varying(4000),
    UNDEREXPRECLAMATIONCOST numeric(14,2),
    PLACERUNDERGROUNDOPERATIONS character varying(3),
    PLACERHANDOPERATIONS character varying(3),
    PLACERRECLAMATIONAREA numeric(14,2),
    PLACERRECLAMATION character varying(4000),
    PLACERRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYDEPTHOVERBURDEN numeric(14,2),
    SANDGRVQRYDEPTHTOPSOIL numeric(14,2),
    SANDGRVQRYSTABILIZEMEASURES character varying(4000),
    SANDGRVQRYWITHINAGLANDRES character varying(3),
    SANDGRVQRYALRPERMITNUMBER character varying(300),
    SANDGRVQRYLOCALGOVSOILREMBYLAW character varying(3),
    SANDGRVQRYOFFICIALCOMMPLAN character varying(4000),
    SANDGRVQRYLANDUSEZONING character varying(4000),
    SANDGRVQRYENDLANDUSE character varying(4000),
    SANDGRVQRYTOTALMINERES integer,
    SANDGRVQRYTOTALMINERESUNITS character varying(20),
    SANDGRVQRYANNUALEXTREST integer,
    SANDGRVQRYANNUALEXTRESTUNITS character varying(20),
    SANDGRVQRYRECLAMATION character varying(4000),
    SANDGRVQRYRECLAMATIONBACKFILL character varying(4000),
    SANDGRVQRYRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYGRDWTRAVGDEPTH numeric(14,1),
    SANDGRVQRYGRDWTREXISTINGAREAS character varying(3),
    SANDGRVQRYGRDWTRTESTPITS character varying(3),
    SANDGRVQRYGRDWTRTESTWELLS character varying(3),
    SANDGRVQRYGRDWTROTHER character varying(4000),
    SANDGRVQRYGRDWTRMEASPROTECT character varying(4000),
    SANDGRVQRYIMPACTDISTRES integer,
    SANDGRVQRYIMPACTDISTWATER integer,
    SANDGRVQRYIMPACTNOISE character varying(4000),
    SANDGRVQRYIMPACTPRVTACCESS character varying(4000),
    SANDGRVQRYIMPACTPREVTDUST character varying(4000),
    SANDGRVQRYIMPACTMINVISUAL character varying(4000),
    CUTLINESEXPLGRIDTOTALLINEKMS integer,
    CUTLINESEXPLGRIDTIMBERVOLUME numeric(14,2),
    CUTLINESRECLAMATION character varying(4000),
    CUTLINESRECLAMATIONCOST numeric(14,2),
    PONDSWASTEWATERTREATFACILITY character varying(4000),
    FREEUSEPERMIT character varying(3),
    LICENCETOCUT character varying(3),
    TIMBERTOTALVOLUME numeric(14,2),
    CAMPBUILDSTGETOTALDISTAREA numeric(14,2),
    MECHTRENCHINGTOTALDISTAREA numeric(14,2),
    EXPSURFACEDRILLTOTALDISTAREA numeric(14,2),
    EXPACCESSTOTALDISTAREA numeric(14,2),
    SURFACEBULKSAMPLETOTALDISTAREA numeric(14,2),
    PLACERTOTALDISTAREA numeric(14,2),
    UNDEREXPTOTALDISTAREA numeric(14,2),
    SANDGRVQRYTOTALDISTAREA numeric(14,2),
    PONDSTOTALDISTAREA numeric(14,2),
    RECLCOSTSUBTOTAL numeric(14,2),
    RECLCOSTEXIST numeric(14,2),
    RECLCOSTRECL numeric(14,2),
    RECLCOSTTOTAL numeric(14,2),
    RECLAREASUBTOTAL numeric(14,2),
    RECLAREAEXIST numeric(14,2),
    RECLAREARECL numeric(14,2),
    RECLAREATOTAL numeric(14,2),
    ANYOTHERINFORMATION character varying(4000),
    VFCBCAPPLICATIONURL character varying(4000),
    MESSAGECREATEDDATE date,
    PROCESSED character varying(1),
    PROCESSEDDATE date,
    CUTLINESEXPLGRIDDISTURBEDAREA numeric(14,2),
    PONDSRECYCLED character varying(3),
    PONDSEXFILTRATEDTOGROUND character varying(3),
    PONDSDISCHARGEDTOENV character varying(3),
    PONDSRECLAMATION character varying(4000),
    PONDSRECLAMATIONCOST numeric(14,2),
    SANDGRVQRYTOTALEXISTDISTAREA numeric(14,2),
    NRSOSAPPLICATIONID character varying(50),
    ISBLASTSELECT character varying(3),
    ISTIMBERSELECT character varying(3),

    FOREIGN KEY (APPLICANTCLIENTID) REFERENCES NOW_Submissions.client(CLIENTID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SUBMITTERCLIENTID) REFERENCES NOW_Submissions.client(CLIENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.contact (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
    TYPE character varying(30),
    ORG_LEGALNAME character varying(250),
    ORG_DOINGBUSINESSAS character varying(150),
    IND_FIRSTNAME character varying(60),
    IND_LASTNAME character varying(60),
    IND_MIDDLENAME character varying(60),
    IND_PHONENUMBER character varying(10),
    DAYPHONENUMBER character varying(10),
    DAYPHONENUMBEREXT character varying(4),
    FAXNUMBER character varying(10),
    EMAIL character varying(60),
    ORG_BCFEDINCORPNUMBER character varying(30),
    ORG_BCREGNUMBER character varying(9),
    ORG_SOCIETYNUMBER character varying(30),
    ORG_HSTREGNUMBER character varying(30),
    ORG_CONTACTNAME character varying(4000),
    MAILINGADDRESSLINE1 character varying(4000),
    CONTACTTYPE character varying(4000),
    CONTACTCERTIFICATIONTYPE character varying(200),
    CONTACTCERTIFICATIONID character varying(4000),
    MAILINGADDRESSLINE2 character varying(60),
    MAILINGADDRESSCITY character varying(100),
    MAILINGADDRESSPROVSTATE character varying(200),
    MAILINGADDRESSCOUNTRY character varying(50),
    MAILINGADDRESSPOSTALZIP character varying(10),
    SEQ_NO integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.settling_pond (
    SETTLINGPONDID integer PRIMARY KEY,
	PONDID character varying(4000),
	WATERSOURCE character varying(4000),
	WIDTH integer,
	LENGTH integer,
	DEPTH integer,
	CONSTRUCTIONMETHOD character varying(4000),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

CREATE TABLE NOW_Submissions.status_update (
    ID serial PRIMARY KEY,
    BUSINESSAREANUMBER character varying(50),
	STATUS character varying(60),
	STATUSUPDATEDATE DATE,
	PROCESSED character varying(1),
	PROCESSEDDATE DATE,
	REQUESTSTATUS character varying(20),
	REQUESTMESSAGE character varying(4000),
	SEQNUM integer,
	STATUSREASON character varying(4000),
	APPLICATIONTYPE character varying(100)
);

CREATE TABLE NOW_Submissions.surface_bulk_sample_activity (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	TYPE character varying(4000),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.document (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	DOCUMENTURL character varying(4000),
	FILENAME character varying(4000),
	DOCUMENTTYPE character varying(4000),
	DESCRIPTION character varying(4000),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.document_nda (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	DOCUMENTURL character varying(4000),
	FILENAME character varying(4000),
	DOCUMENTTYPE character varying(4000),
	DESCRIPTION character varying(4000),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application_nda(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.document_start_stop (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	DOCUMENTURL character varying(4000),
	FILENAME character varying(4000),
	DOCUMENTTYPE character varying(4000),
	DESCRIPTION character varying(4000),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application_start_stop(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.placer_activity (
    PLACERACTIVITYID integer PRIMARY KEY,
	TYPE character varying(4000),
	QUANTITY integer,
	DEPTH integer,
	LENGTH integer,
	WIDTH integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2)
);

CREATE TABLE NOW_Submissions.sand_grv_qry_activity (
    ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.under_exp_new_activity (
    ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	INCLINE numeric(14,1),
	INCLINEUNITS character varying(20),
	QUANTITY integer,
	LENGTH numeric(14,1),
	WIDTH numeric(14,1),
	HEIGHT numeric(14,1),
	SEQ_NO integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.under_exp_rehab_activity (
    ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	INCLINE numeric(14,1),
	INCLINEUNITS character varying(20),
	QUANTITY integer,
	LENGTH numeric(14,1),
	WIDTH numeric(14,1),
	HEIGHT numeric(14,1),
	SEQ_NO integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.under_exp_surface_activity (
    ID serial PRIMARY KEY,
	MESSAGEID integer,
	TYPE character varying(4000),
	QUANTITY integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.water_source_activity (
    ID serial PRIMARY KEY,
	MESSAGEID integer,
	SOURCEWATERSUPPLY character varying(4000),
	TYPE character varying(4000),
	USEOFWATER character varying(4000),
	ESTIMATERATEWATER numeric(14,2),
	PUMPSIZEINWATER numeric(14,2),
	LOCATIONWATERINTAKE character varying(4000),
	SEQ_NO integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.existing_placer_activity_xref (
    MESSAGEID integer,
	PLACERACTIVITYID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.existing_settling_pond_xref (
    MESSAGEID integer,
	SETTLINGPONDID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.mech_trenching_equip_xref (
    MESSAGEID integer,
	EQUIPMENTID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.surface_bulk_sample_equip_xref (
	MESSAGEID integer,
	EQUIPMENTID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.sand_grv_qry_equip_xref (
	MESSAGEID integer,
	EQUIPMENTID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.placer_equip_xref (
    MESSAGEID integer,
	EQUIPMENTID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.proposed_placer_activity_xref (
    MESSAGEID integer,
	PLACERACTIVITYID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (PLACERACTIVITYID) REFERENCES NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.proposed_settling_pond_xref (
    MESSAGEID integer,
	SETTLINGPONDID integer,

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (SETTLINGPONDID) REFERENCES NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.exp_access_activity (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	TYPE character varying(4000),
	LENGTH numeric(14,2),
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.exp_surface_drill_activity (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	TYPE character varying(4000),
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);

CREATE TABLE NOW_Submissions.mech_trenching_activity (
    ID serial PRIMARY KEY,
    MESSAGEID integer,
	TYPE character varying(4000),
	NUMBEROFSITES integer,
	DISTURBEDAREA numeric(14,2),
	TIMBERVOLUME numeric(14,2),

    FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
);