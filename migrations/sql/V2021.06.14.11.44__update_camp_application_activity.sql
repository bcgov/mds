CREATE TABLE IF NOT EXISTS activity_summary_building_detail_xref (
	activity_summary_id INTEGER NOT NULL REFERENCES activity_summary(activity_summary_id), 
	activity_detail_id INTEGER NOT NULL REFERENCES activity_detail(activity_detail_id),
	
    PRIMARY KEY(activity_summary_id, activity_detail_id)
);
ALTER TABLE activity_summary_building_detail_xref OWNER TO mds;

CREATE TABLE IF NOT EXISTS activity_summary_staging_area_detail_xref (
	activity_summary_id INTEGER NOT NULL REFERENCES activity_summary(activity_summary_id), 
	activity_detail_id INTEGER NOT NULL REFERENCES activity_detail(activity_detail_id),
	
    PRIMARY KEY(activity_summary_id, activity_detail_id)
);
ALTER TABLE activity_summary_staging_area_detail_xref OWNER TO mds;


ALTER TABLE camp DROP COLUMN camp_name;
ALTER TABLE camp DROP COLUMN camp_number_people;
ALTER TABLE camp DROP COLUMN camp_number_structures;

ALTER TABLE camp 
ADD COLUMN IF NOT EXISTS health_authority_consent boolean,
ADD COLUMN IF NOT EXISTS health_authority_notified boolean;

CREATE TABLE IF NOT EXISTS camp_detail  (
  activity_detail_id   INTEGER PRIMARY KEY REFERENCES activity_detail(activity_detail_id), 
  number_people		numeric,
  number_structures numeric,
  description_of_structures varchar,
  waste_disposal varchar,
  sanitary_facilities varchar,
  water_supply varchar
);
ALTER TABLE camp_detail OWNER TO mds;


CREATE TABLE IF NOT EXISTS building_detail  (
  activity_detail_id   INTEGER PRIMARY KEY REFERENCES activity_detail(activity_detail_id), 
  purpose      varchar,
  structure		varchar
);
ALTER TABLE building_detail OWNER TO mds;