CREATE TABLE variance_application_status_code (
    variance_application_status_code character varying(3)                   NOT NULL,
    description                      character varying(100)                 NOT NULL,
    active_ind                       boolean                  DEFAULT true  NOT NULL,
    create_user                      character varying(60)                  NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,
    update_user                      character varying(60)                  NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,

    UNIQUE(variance_application_status_code)
);

ALTER TABLE variance_application_status_code OWNER TO mds;

COMMENT ON TABLE variance_application_status_code IS 'The valid options for a variance / variance application.';

INSERT INTO variance_application_status_code (
    variance_application_status_code,
    description,
    create_user,
    update_user
)
VALUES
    ('REV', 'In Review', 'system-mds', 'system-mds'),
    ('NAP', 'Not Applicable', 'system-mds', 'system-mds'),
    ('APP', 'Approved', 'system-mds', 'system-mds'),
    ('DEN', 'Denied', 'system-mds', 'system-mds');


ALTER TABLE variance
ADD COLUMN variance_application_status_code character varying(3) DEFAULT 'REV' NOT NULL,
ADD COLUMN ohsc_ind                         boolean              DEFAULT FALSE NOT NULL,
ADD COLUMN union_ind                        boolean              DEFAULT FALSE NOT NULL,
ADD COLUMN inspector_id                     integer                                    ,
ADD COLUMN variance_no                      integer                            NOT NULL;

COMMENT ON COLUMN variance.variance_no IS 'A public, unique identifier for a variance.';

ALTER TABLE variance
ALTER COLUMN issue_date  DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL;

ALTER TABLE variance
ALTER COLUMN issue_date    DROP DEFAULT,
ALTER COLUMN expiry_date   DROP DEFAULT,
ALTER COLUMN received_date DROP DEFAULT;

ALTER TABLE variance
ADD UNIQUE (mine_guid, variance_no);

ALTER TABLE variance
ADD CONSTRAINT variance_status_variance_application_status_code_fkey
    FOREIGN KEY (variance_application_status_code)
    REFERENCES variance_application_status_code(variance_application_status_code)
    DEFERRABLE INITIALLY DEFERRED,
ADD CONSTRAINT variance_inspector_core_user_fkey
    FOREIGN KEY (inspector_id) REFERENCES core_user(core_user_id) DEFERRABLE INITIALLY DEFERRED,

-- Business Rule Constraints
ADD CONSTRAINT inspector_required_on_reviewed_application
    CHECK (NOT (inspector_id IS NULL AND (
              variance_application_status_code = 'APP' OR variance_application_status_code = 'DEN'
          ) ) ),
ADD CONSTRAINT issue_date_required_on_approved_variance
    CHECK (NOT (issue_date IS NULL AND variance_application_status_code = 'APP') ),
ADD CONSTRAINT expiry_date_required_on_approved_variance
    CHECK (NOT (expiry_date IS NULL AND variance_application_status_code = 'APP') );

CREATE OR REPLACE FUNCTION add_incremented_variance_no() RETURNS trigger AS $$
    DECLARE
        max_mine_variance_no integer;
    BEGIN
        SELECT
            CASE
                WHEN (MAX(variance_no) IS NOT NULL)
                THEN MAX(variance_no)
                ELSE 0
            END
            FROM variance
            WHERE mine_guid = NEW.mine_guid INTO max_mine_variance_no;

        NEW.variance_no := max_mine_variance_no + 1;
        RETURN NEW;
    END;
$$LANGUAGE plpgsql;

CREATE TRIGGER new_variance_no
  BEFORE INSERT
  ON variance
  FOR EACH ROW
  EXECUTE PROCEDURE add_incremented_variance_no();
