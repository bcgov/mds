CREATE TABLE IF NOT EXISTS now_party_appointment
(
    now_party_appointment_guid                uuid DEFAULT gen_random_uuid() NOT NULL,
    mine_party_appt_type_code                 character varying(3)           NOT NULL,
    application_id                            integer                        NOT NULL,
    party_guid                                uuid                           NOT NULL,

    PRIMARY KEY(mine_commodity_code, mine_tenure_type_code),

    FOREIGN KEY (mine_party_appt_type_code) REFERENCES mine_commodity_code(mine_party_appt_type_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (application_id) REFERENCES application(id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED
);

alter table party ADD COLUMN bc_federal_incorporation_number varchar(30);
alter table party ADD COLUMN bc_registration_number varchar(10);
alter table party ADD COLUMN society_number varchar(30);
alter table party ADD COLUMN hst_registration_number varchar(30);
alter table party ADD COLUMN fax_number varchar(12);
