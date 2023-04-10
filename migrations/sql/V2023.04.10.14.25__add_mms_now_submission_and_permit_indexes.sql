CREATE INDEX IF NOT EXISTS application_pkey ON mms_now_submissions.application (id);

CREATE INDEX IF NOT EXISTS permit_conditions_parent_permit_condition_idx ON permit_conditions USING btree (parent_permit_condition_id);