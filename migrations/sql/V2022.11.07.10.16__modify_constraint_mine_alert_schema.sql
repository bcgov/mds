ALTER table mine_alert
DROP CONSTRAINT mine_guid_date_range_uniq;

ALTER table mine_alert
ADD CONSTRAINT mine_guid_date_range_uniq EXCLUDE USING gist ((mine_guid::text) WITH =, tstzrange(start_date,end_date,'[]') WITH &&) WHERE (deleted_ind = False)