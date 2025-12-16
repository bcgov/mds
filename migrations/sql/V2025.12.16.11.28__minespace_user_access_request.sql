CREATE TABLE IF NOT EXISTS minespace_user_roles (
    minespace_user_role_code                              character varying(3)                 PRIMARY KEY,
    description                                           character varying(100)                  NOT NULL,
    active_ind                                            boolean DEFAULT true                    NOT NULL,
    create_user                                           character varying(60)                   NOT NULL,
    create_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                           character varying(60)                   NOT NULL,
    update_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL
);
COMMENT ON TABLE minespace_user_roles 'Roles that a minespace user may have with a mine';

INSERT INTO minespace_user_roles (
    minespace_user_role_code,
    description,
    create_user,
    update_user
) VALUES ('AGT', 'Agent', 'system-mds', 'system-mds'),
         ('HSR', 'Health and Safety Representative', 'system-mds', 'system-mds'),
         ('MMG', 'Mine Manager', 'system-mds', 'system-mds'),
         ('PMT', 'Permittee', 'system-mds', 'system-mds'),
         ('CON', 'Contractor', 'system-mds', 'system-mds'),
         ('OTH', 'Other', 'system-mds', 'system-mds');

ALTER TABLE minespace_user 
    ADD COLUMN access_request_text VARCHAR(100),
    ADD COLUMN ministry_contact VARCHAR(100),
    ADD COLUMN is_pending BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS minespace_user_role_xref (
    minespace_user_role_xref_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    minespace_user_role_code VARCHAR(3) NOT NULL,
    minespace_user_id INT NOT NULL,
    mine_guid UUID NOT NULL,
    is_pending BOOLEAN NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL, 
    
    CONSTRAINT fk_minespace_user_role_code FOREIGN KEY (minespace_user_role_code)
        REFERENCES minespace_user_role.minespace_user_role_code,
    CONSTRAINT fk_minespace_user_id FOREIGN KEY (minespace_user_id)
        REFERENCES minespace_user.user_id,
    CONSTRAINT fk_minespace_user_mine_role FOREIGN KEY (mine_guid)
        REFERENCES mine.mine_guid
);
COMMENT ON TABLE minespace_user_role_xref 'Xref between the minespace user and the role they have (or requested to have)';

CREATE TABLE IF NOT EXISTS minespace_user_document_xref (
    minespace_user_document_xref_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    minespace_user_id INT NOT NULL,
    document_manager_guid UUID NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL,

    CONSTRAINT fk_minespace_user_id FOREIGN KEY (minespace_user_id)
        REFERENCES minespace_user.user_id
);
COMMENT ON TABLE minespace_user_document_xref 'Authorization letter document tied to minespace user access request';
