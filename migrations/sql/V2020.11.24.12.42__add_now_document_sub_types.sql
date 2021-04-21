CREATE TABLE IF NOT EXISTS now_application_document_sub_type (
    now_application_document_sub_type_code   varchar(3) PRIMARY KEY,
    description                              varchar(50),
    active_ind                               boolean DEFAULT true NOT NULL,
    create_user                              character varying(60) NOT NULL,
    create_timestamp                         timestamp with time zone DEFAULT now() NOT NULL,
    update_user                              character varying(60) NOT NULL,
    update_timestamp                         timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE now_application_document_sub_type OWNER TO mds;

INSERT INTO now_application_document_sub_type
(now_application_document_sub_type_code, description, active_ind, create_user, update_user)
values
('SDO', 'Securities Documents', true, 'system-mds', 'system-mds'),
('GDO', 'Government Documents', true, 'system-mds', 'system-mds'),
('MDO', 'Map Documents', true, 'system-mds', 'system-mds')
on conflict do nothing;

ALTER TABLE now_application_document_type ADD COLUMN now_application_document_sub_type_code varchar REFERENCES now_application_document_sub_type(now_application_document_sub_type_code);
