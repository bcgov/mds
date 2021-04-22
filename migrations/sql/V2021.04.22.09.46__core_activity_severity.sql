
CREATE TABLE IF NOT EXISTS core_activity_severity_type (
	core_activity_severity_type_code varchar(3),
	description varchar NOT NULL,
	display_order int4 NULL,
	active_ind bool NOT NULL DEFAULT true,
	create_user varchar NOT NULL,
	create_timestamp timestamptz NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamptz NOT NULL DEFAULT now(),
	CONSTRAINT core_activity_severity_type_pkey PRIMARY KEY (core_activity_severity_type_code)
);

INSERT INTO core_activity_severity_type
(
    core_activity_severity_type_code,
    description,
    display_order,
    create_user,
    update_user
)
VALUES
    ('LOW', 'Low', 10, 'system-mds', 'system-mds'),
    ('NOR', 'Normal', 20, 'system-mds', 'system-mds'),
    ('CRI', 'Critical', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE ONLY core_activity ADD COLUMN IF NOT EXISTS activity_severity_code varchar NOT NULL DEFAULT 'NOR';

ALTER TABLE ONLY core_activity
    ADD CONSTRAINT core_activity_core_activity_severity_type_code_fkey FOREIGN KEY (activity_severity_code) REFERENCES core_activity_severity_type(core_activity_severity_type_code) DEFERRABLE INITIALLY DEFERRED;