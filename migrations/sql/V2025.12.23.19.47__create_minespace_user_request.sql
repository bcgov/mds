-- Create minespace_user_request table to track user access request submissions
CREATE TABLE IF NOT EXISTS minespace_user_request (
    minespace_user_request_id                             SERIAL                                  PRIMARY KEY,
    user_sub                                              VARCHAR(255)                            NOT NULL UNIQUE,
    minespace_user_id                                     INT,
    submitted_timestamp                                   timestamp with time zone DEFAULT now()  NOT NULL,
    role_requested                                        VARCHAR(3),
    business_name                                         VARCHAR(255),
    access_request_text                                   VARCHAR(100),
    ministry_contact                                      VARCHAR(100),
    permittee                                             JSONB,
    request_status                                        SMALLINT DEFAULT 0                      NOT NULL,
    create_user                                           VARCHAR(60)                             NOT NULL,
    create_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                           VARCHAR(60)                             NOT NULL,
    update_timestamp                                      timestamp with time zone DEFAULT now()  NOT NULL,
    
    CONSTRAINT fk_minespace_user_id FOREIGN KEY (minespace_user_id)
        REFERENCES minespace_user(user_id),
    CONSTRAINT fk_role_requested FOREIGN KEY (role_requested)
        REFERENCES minespace_user_role(minespace_user_role_code)
);

COMMENT ON TABLE minespace_user_request IS 'Tracks minespace user access request form submissions. The user_sub from the BCeID token uniquely identifies the request and can be linked to minespace_user once created.';
COMMENT ON COLUMN minespace_user_request.user_sub IS 'BCeID sub claim from JWT token - uniquely identifies the user';
COMMENT ON COLUMN minespace_user_request.minespace_user_id IS 'Foreign key to minespace_user - will be null until the user record is created';
COMMENT ON COLUMN minespace_user_request.submitted_timestamp IS 'When the user submitted the access request form';
COMMENT ON COLUMN minespace_user_request.role_requested IS 'The role/position the user requested';
COMMENT ON COLUMN minespace_user_request.business_name IS 'Business name for contractors/consultants registered with Business BCeID';
COMMENT ON COLUMN minespace_user_request.access_request_text IS 'Additional text from the user about mines/permits not in the system';
COMMENT ON COLUMN minespace_user_request.ministry_contact IS 'Email of MCM Inspector or staff member the user has been in contact with';
COMMENT ON COLUMN minespace_user_request.permittee IS 'Permittee contact information in JSON format (name, title, email, phone)';
COMMENT ON COLUMN minespace_user_request.request_status IS 'Status of the request: 0 = Pending, 1 = Approved, 2 = Rejected';

-- Create index on user_sub for efficient lookups
CREATE INDEX idx_minespace_user_request_user_sub ON minespace_user_request(user_sub);
