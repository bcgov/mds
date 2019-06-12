-- 1) Add new status code option
INSERT INTO variance_application_status_code (
    variance_application_status_code,
    description,
    create_user,
    update_user
) VALUES (
    'RFD',
    'Ready for Decision',
    'system-mds',
    'system-mds'
);


-- 2) Update variance table to track notification state
ALTER TABLE variance
ADD COLUMN parties_notified_ind boolean DEFAULT FALSE NOT NULL;


-- 3) Add categories to variance documents
CREATE TABLE IF NOT EXISTS variance_document_category_code
(
    variance_document_category_code varchar(3)   PRIMARY KEY                        ,
    description                     varchar(100)                            NOT NULL,
    active_ind                      boolean                  DEFAULT TRUE   NOT NULL,
    create_user                     character varying(60)                   NOT NULL,
    create_timestamp                timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                     character varying(60)                   NOT NULL,
    update_timestamp                timestamp with time zone DEFAULT now()  NOT NULL
);

ALTER TABLE variance_document_category_code OWNER TO mds;

COMMENT ON TABLE variance_document_category_code IS 'Contains a list of values used to describe the relationship between a document and a variance.';

INSERT INTO variance_document_category_code (
    variance_document_category_code,
    description,
    create_user,
    update_user
) VALUES (
    'REQ',
    'Request',
    'system-mds',
    'system-mds'
),
(
    'REC',
    'Recommendation',
    'system-mds',
    'system-mds'
),
(
    'DEC',
    'Decision',
    'system-mds',
    'system-mds'
);


-- Create category column and migrate existing data
ALTER TABLE variance_document_xref
ADD COLUMN variance_document_category_code varchar(3) DEFAULT 'REQ' NOT NULL;

-- Drop column default for all future records
ALTER TABLE variance_document_xref
ALTER COLUMN variance_document_category_code DROP DEFAULT;


ALTER TABLE ONLY variance_document_xref
    ADD CONSTRAINT variance_document_xref_category_code
    FOREIGN KEY (variance_document_category_code)
    REFERENCES variance_document_category_code(variance_document_category_code);
