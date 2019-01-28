CREATE EXTENSION btree_gist;

ALTER TABLE mine_party_appt ADD EXCLUDE USING gist ((mine_guid::text) WITH =, daterange(start_date,end_date,'[]') WITH &&) WHERE ( mine_party_appt_type_code = 'MMG')