CREATE TABLE IF NOT EXISTS permit_condition_tag_xref (
    permit_condition_tag_xref_guid   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    permit_condition_tag_guid UUID NOT NULL,
    permit_condition_id INT NOT NULL,
    create_user         VARCHAR(60) NOT NULL,
    create_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    update_user         VARCHAR(60) NOT NULL,
    update_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind         BOOLEAN DEFAULT false,
    CONSTRAINT fk_permit_condition
        FOREIGN KEY (permit_condition_id)
            REFERENCES permit_conditions (permit_condition_id),
    CONSTRAINT fk_permit_condition_tag
        FOREIGN KEY (permit_condition_tag_guid)
            REFERENCES permit_condition_tag (permit_condition_tag_guid)
);