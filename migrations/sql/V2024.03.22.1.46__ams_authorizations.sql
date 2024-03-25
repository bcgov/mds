ALTER TABLE project_summary_authorization
    ADD COLUMN IF NOT EXISTS amendment_changes text[], -- array of change types
    ADD COLUMN IF NOT EXISTS amendment_severity varchar(3), -- SIG or MIN
    ADD COLUMN IF NOT EXISTS is_contaminated boolean,
    ADD COLUMN IF NOT EXISTS new_type varchar(3), -- permit | approval
    ADD COLUMN IF NOT EXISTS authorization_description varchar(4000),
    ADD COLUMN IF NOT EXISTS exemption_requested boolean
    ;

DO
$$
DECLARE 
    authorization record;
    auth_no text;
    auth_array text[];
    i integer;
    n integer;

    other_types text[];
    type_count integer;
    delete_guids uuid[];
BEGIN
    -- target authorizations with multiple auth # amendments related to EMA
    FOR authorization IN SELECT * FROM project_summary_authorization 
        WHERE 'AMENDMENT'=ANY(project_summary_permit_type) 
        AND cardinality(existing_permits_authorizations) > 1
        AND project_summary_authorization_type IN(
            SELECT project_summary_authorization_type FROM project_summary_authorization_type 
                WHERE project_summary_authorization_type_group_id = 'ENVIRONMENTAL_MANAGMENT_ACT')
    LOOP
        -- create a record for each auth no
        i := 1;
        n := cardinality("authorization"."existing_permits_authorizations");
        auth_array := "authorization"."existing_permits_authorizations"; 

        type_count := cardinality("authorization"."project_summary_permit_type");
        IF type_count = 1 THEN
            delete_guids := delete_guids || "authorization"."project_summary_authorization_guid";
        ELSE
            other_types := array_remove("authorization"."project_summary_permit_type", 'AMENDMENT');
            UPDATE project_summary_authorization 
                SET project_summary_permit_type = other_types, existing_permits_authorizations = ARRAY[]::text[]
                WHERE project_summary_authorization_guid = "authorization"."project_summary_authorization_guid"; 
                END IF; 

        LOOP
            auth_no := TRIM(auth_array[i]);
            IF auth_no != '' THEN
                INSERT INTO project_summary_authorization (
                    project_summary_guid, 
                    project_summary_authorization_type,
                    project_summary_permit_type,
                    existing_permits_authorizations,
                    deleted_ind,
                    create_user,
                    create_timestamp,
                    update_user,
                    update_timestamp
                ) VALUES (
                    "authorization"."project_summary_guid", 
                    "authorization"."project_summary_authorization_type",
                    '{"AMENDMENT"}',
                    ARRAY [auth_no], 
                    "authorization"."deleted_ind",
                    "authorization"."create_user",
                    "authorization"."create_timestamp",
                    "authorization"."update_user",
                    "authorization"."update_timestamp"
                );
            END IF;

            i := i + 1;
            EXIT WHEN i > n;
            
        END LOOP;
    END LOOP;

    DELETE FROM project_summary_authorization 
        WHERE project_summary_authorization.project_summary_authorization_guid =ANY(delete_guids);
END
$$         