CREATE TABLE IF NOT EXISTS now_submissions.fuel (
    id serial PRIMARY KEY,
    messageid integer REFERENCES now_submissions.application(messageid) DEFERRABLE INITIALLY DEFERRED,
    fueltype varchar,
    fuelrelatedactivity varchar,
    estimatedfuelvolume numeric(14,2),
    descriptionoffuelrelatedactivity varchar,
    descriptionofprecautionarymeasures varchar
);
ALTER TABLE now_submissions.fuel OWNER TO mds;

CREATE TABLE IF NOT EXISTS activity_summary_fuel_detail_xref (
    activity_summary_id INTEGER NOT NULL REFERENCES activity_summary(activity_summary_id),
    activity_detail_id INTEGER NOT NULL REFERENCES activity_detail(activity_detail_id) ON DELETE CASCADE,

    PRIMARY KEY(activity_summary_id, activity_detail_id)
);
ALTER TABLE activity_summary_fuel_detail_xref OWNER TO mds;

CREATE TABLE IF NOT EXISTS fuel_detail (
  activity_detail_id INTEGER PRIMARY KEY REFERENCES activity_detail(activity_detail_id),
  fuel_type varchar,
  fuel_related_activity varchar,
  estimated_fuel_volume numeric(14,2),
  description_of_fuel_related_activity varchar,
  description_of_precautionary_measures varchar
);
ALTER TABLE fuel_detail OWNER TO mds;
