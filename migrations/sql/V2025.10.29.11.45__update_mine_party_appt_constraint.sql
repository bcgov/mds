-- remove existing date overlap constraint
ALTER TABLE mine_party_appt DROP CONSTRAINT mine_party_appt_mine_guid_daterange_excl;

-- only constrain non-deleted contacts and allow overlaps on the end date
ALTER TABLE mine_party_appt ADD EXCLUDE USING gist ((mine_guid::text) WITH =, daterange(start_date,end_date,'[)')
    WITH &&) WHERE ( mine_party_appt_type_code = 'MMG' AND NOT deleted_ind);