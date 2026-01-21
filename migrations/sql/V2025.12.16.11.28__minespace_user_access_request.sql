CREATE TABLE IF NOT EXISTS minespace_user_role (
    minespace_user_role_code                              VARCHAR(3)                           PRIMARY KEY,
    description                                           VARCHAR(100)                            NOT NULL,
    active_ind                                            boolean DEFAULT true                    NOT NULL,
    create_user                                           VARCHAR(60)                             NOT NULL,
    create_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                           VARCHAR(60)                             NOT NULL,
    update_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL
);
COMMENT ON TABLE minespace_user_role IS 'Roles that a minespace user may have with a mine';

INSERT INTO minespace_user_role (
    minespace_user_role_code,
    description,
    create_user,
    update_user
) VALUES ('PMT', 'Permittee', 'system-mds', 'system-mds'),
         ('MMG', 'Mine Manager', 'system-mds', 'system-mds'),
         ('ADM', 'MineSpace Administrator', 'system-mds', 'system-mds'),
         ('EMP', 'Employee', 'system-mds', 'system-mds'),
         ('CON', 'Contractor/Consultant', 'system-mds', 'system-mds'),
         ('AGT', 'Agent', 'system-mds', 'system-mds'),
         ('NUL', 'General Public/Researcher', 'system-mds', 'system-mds');

CREATE TABLE IF NOT EXISTS minespace_user_role_xref (
    minespace_user_role_xref_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    minespace_user_role_code VARCHAR(3) NOT NULL,
    minespace_user_id INT NOT NULL,
    mine_guid UUID NOT NULL,
    is_pending BOOLEAN NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL,
    create_user                                           VARCHAR(60)                             NOT NULL,
    create_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                           VARCHAR(60)                             NOT NULL,
    update_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    
    CONSTRAINT fk_minespace_user_role_code FOREIGN KEY (minespace_user_role_code)
        REFERENCES minespace_user_role(minespace_user_role_code),
    CONSTRAINT fk_minespace_user_id FOREIGN KEY (minespace_user_id)
        REFERENCES minespace_user(user_id),
    CONSTRAINT fk_minespace_user_mine_role FOREIGN KEY (mine_guid)
        REFERENCES mine(mine_guid)
);
COMMENT ON TABLE minespace_user_role_xref IS 'Xref between the minespace user and the role they have (or requested to have) for a mine';

CREATE TABLE IF NOT EXISTS minespace_user_document_xref (
    minespace_user_document_xref_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    minespace_user_id INT NOT NULL,
    document_manager_guid UUID NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    upload_date DATE DEFAULT now() NOT NULL,
    deleted_ind BOOLEAN DEFAULT false NOT NULL,

    CONSTRAINT fk_minespace_user_id FOREIGN KEY (minespace_user_id)
        REFERENCES minespace_user(user_id)
);
COMMENT ON TABLE minespace_user_document_xref IS 'Authorization letter document tied to minespace user access request';
