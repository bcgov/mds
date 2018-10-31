CREATE INDEX mine_detail_mine_guid_idx ON mine_detail (mine_guid);

CREATE INDEX mineral_tenure_mine_guid_idx ON mineral_tenure_xref (mine_guid);

CREATE INDEX mgr_appointment_mine_guid_idx ON mgr_appointment (mine_guid);

CREATE INDEX mine_location_mine_guid_idx ON mine_location (mine_guid);
CREATE INDEX mine_location_lat_long_idx ON mine_location (latitude, longitude);

CREATE INDEX permit_mine_guid_idx ON permit (mine_guid);

CREATE INDEX mine_status_mine_guid_idx ON mine_status (mine_guid);