alter table MMS_NOW_Submissions.application add column SETTLINGPONDDISTURBEDAREA numeric(14,2);
alter table MMS_NOW_Submissions.application add column SETTLINGPONDTIMBERVOLUME numeric(14,2);
alter table MMS_NOW_Submissions.application add column SETTLINGPONDTOTALEXISTDISTAREA numeric(14,2);

alter table MMS_NOW_Submissions.application add column PLACERDISTURBEDAREA numeric(14,2);
alter table MMS_NOW_Submissions.application add column PLACERTIMBERVOLUME numeric(14,2);
alter table MMS_NOW_Submissions.application add column PLACERTOTALEXISTDISTAREA numeric(14,2);

DROP TABLE IF EXISTS MMS_NOW_Submissions.settling_pond;
DROP TABLE IF EXISTS MMS_NOW_Submissions.existing_settling_pond_xref;
DROP TABLE IF EXISTS MMS_NOW_Submissions.proposed_settling_pond_xref;
