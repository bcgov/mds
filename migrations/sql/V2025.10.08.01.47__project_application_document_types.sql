INSERT INTO major_mine_application_document_type 
    (major_mine_application_document_type_code, description, display_order, create_user, update_user) 
VALUES ('APX', 'Appendix', 15, 'system-mds', 'system-mds');

CREATE TABLE IF NOT EXISTS major_mine_application_document_subtype (
    major_mine_application_document_subtype_code                   character varying(3)                 PRIMARY KEY,
    major_mine_application_document_type_code                 character varying(3)                    NOT NULL,
    description                                               character varying(100)                  NOT NULL,
    display_order                                             smallint                                NOT NULL,
    active_ind                                                boolean DEFAULT true                    NOT NULL,
    create_user                                               character varying(60)                   NOT NULL,
    create_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                               character varying(60)                   NOT NULL,
    update_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL,

    CONSTRAINT mma_doc_type_code_fkey 
        FOREIGN KEY (major_mine_application_document_type_code) 
        REFERENCES major_mine_application_document_type(major_mine_application_document_type_code)
);

INSERT INTO major_mine_application_document_subtype (
    major_mine_application_document_subtype_code,
    major_mine_application_document_type_code,
    description,
    display_order,
    create_user,
    update_user
) VALUES ('INE', 'APX', 'Indigenous Nation Engagement', 10, 'system-mds', 'system-mds'),
         ('BIF', 'APX', 'Baseline Information', 20, 'system-mds', 'system-mds'),
         ('MIP', 'APX', 'Mine Plan', 30, 'system-mds', 'system-mds'),
         ('RCP', 'APX', 'Reclamation and Closure Plan', 40, 'system-mds', 'system-mds'),
         ('WQM', 'APX', 'Water Quality Mitigation and Water Modeling', 50, 'system-mds', 'system-mds'),
         ('EDE', 'APX', 'Effluent Discharges to the Environment', 60, 'system-mds', 'system-mds'),
         ('EEA', 'APX', 'Environmental Effects Assessment', 70, 'system-mds', 'system-mds'),
         ('EMO', 'APX', 'Environmental Monitoring', 80, 'system-mds', 'system-mds'),
         ('MGP', 'APX', 'Management Plans', 90, 'system-mds', 'system-mds'),
         ('RLE', 'APX', 'Reclamation Liability Cost Estimate', 100, 'system-mds', 'system-mds'),
         
         ('QPD', 'SPR', 'Qualified Professional Declaration Form', 110, 'system-mds', 'system-mds'),
         ('TOC', 'SPR', 'Table of Concordance', 120, 'system-mds', 'system-mds'),
         ('SPR', 'SPR', 'Supporting Documents ', 130, 'system-mds', 'system-mds'),
         ('CIF', 'SPR', 'Confidential Information', 140, 'system-mds', 'system-mds');

ALTER TABLE major_mine_application_document_xref
    ADD COLUMN IF NOT EXISTS major_mine_application_document_subtype_code character varying(3),
    ADD CONSTRAINT mma_doc_xref_subtype_code_fkey 
        FOREIGN KEY (major_mine_application_document_subtype_code) 
        REFERENCES major_mine_application_document_subtype(major_mine_application_document_subtype_code);
