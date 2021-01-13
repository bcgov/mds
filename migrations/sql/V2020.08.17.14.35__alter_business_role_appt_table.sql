
ALTER TABLE party_business_role_appt ALTER COLUMN start_date TYPE date;
ALTER TABLE party_business_role_appt ALTER COLUMN end_date TYPE date;

-- added date range consraint that checks if there is no overlapping ranges between start and end date
ALTER TABLE party_business_role_appt ADD CONSTRAINT party_business_role_appt_party_guid_daterange_excl EXCLUDE USING gist (((party_guid)::text) WITH =, daterange(start_date, end_date, '[]'::text) WITH &&) WHERE ((((party_business_role_code)::text = 'INS'::text) AND (NOT deleted_ind)))
