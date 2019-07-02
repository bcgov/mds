CREATE TABLE mine_report_due_date_type (
    mine_report_due_date_type         character varying(3)                    PRIMARY KEY,
    description                       character varying(60)                   NOT NULL   ,
    active_ind                        boolean DEFAULT true                    NOT NULL   ,
    create_user                       character varying(60)                   NOT NULL   ,
    create_timestamp                  timestamp with time zone DEFAULT now()  NOT NULL   ,
    update_user                       character varying(60)                   NOT NULL   ,
    update_timestamp                  timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE mine_report_due_date_type is 'Types of due dates available for mine reports.';
ALTER TABLE mine_report_due_date_type OWNER TO mds;

CREATE TABLE mine_report_submission_status_code (
    mine_report_submission_status_code  character varying(3)                 PRIMARY KEY,
    description                         character varying(100)                  NOT NULL,
    display_order                       smallint                                        ,
    active_ind                          boolean DEFAULT true                    NOT NULL,
    create_user                         character varying(60)                   NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                         character varying(60)                   NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE mine_report_submission_status_code is 'All the possible available status codes for mine reports.';
ALTER TABLE mine_report_submission_status_code OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report_definition (
    mine_report_definition_id            serial                                  PRIMARY KEY, 
    mine_report_definition_guid          uuid                                    NOT NULL   ,
    report_name                          varchar(50)                             NOT NULL   ,
    description                          varchar(300)                            NOT NULL   ,
    compliance_article_id                integer                                 NOT NULL   ,
    due_date_period_months               integer                                 NOT NULL   ,
    mine_report_due_date_type            character varying(3)                    NOT NULL   ,
    active_ind                           boolean DEFAULT true                    NOT NULL   ,
    create_user                          character varying(60)                   NOT NULL   ,
    create_timestamp                     timestamp with time zone DEFAULT now()  NOT NULL   ,
    update_user                          character varying(60)                   NOT NULL   ,
    update_timestamp                     timestamp with time zone DEFAULT now()  NOT NULL   ,

    FOREIGN KEY (compliance_article_id) REFERENCES compliance_article(compliance_article_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_report_due_date_type) REFERENCES mine_report_due_date_type(mine_report_due_date_type) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_report_definition is 'Definitions of code required reports, due dates and articles of the code that apply to them.';
ALTER TABLE mine_report_definition OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report
(
    mine_report_id               serial                                   NOT NULL PRIMARY KEY,
    mine_report_guid             uuid                                     NOT NULL            ,
    mine_report_definition_id    integer                                  NOT NULL            ,
    mine_guid                    uuid                                     NOT NULL            ,
    permit_id                    integer                                                      ,
    due_date                     timestamp                                NOT NULL            ,
    submission_year              smallint                                                     ,
    deleted_ind                  boolean DEFAULT false                    NOT NULL            ,
    create_user                  character varying(60)                    NOT NULL            ,
    create_timestamp             timestamp with time zone DEFAULT now()   NOT NULL            ,
    update_user                  character varying(60)                    NOT NULL            ,
    update_timestamp             timestamp with time zone DEFAULT now()   NOT NULL            ,
    
    FOREIGN KEY (mine_report_definition_id) REFERENCES mine_report_definition(mine_report_definition_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED

);

COMMENT ON TABLE mine_report is 'A report which a mine is required to submit as outlined by the HSRC code or a permit condition on the mine.';
ALTER TABLE mine_report OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report_submission (
    mine_report_submission_id             serial                                  NOT NULL PRIMARY KEY,
    mine_report_submission_guid           uuid                                    NOT NULL            ,
    mine_report_id                        integer                                 NOT NULL            ,
    received_date                         timestamp                                                   ,
    mine_report_submission_status_code    varchar(3)                              NOT NULL            ,
    create_user                           character varying(60)                   NOT NULL            ,
    create_timestamp                      timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user                           character varying(60)                   NOT NULL            ,
    update_timestamp                      timestamp with time zone DEFAULT now()  NOT NULL            ,

    FOREIGN KEY (mine_report_id) REFERENCES mine_report(mine_report_id) DEFERRABLE INITIALLY DEFERRED ,
    FOREIGN KEY (mine_report_submission_status_code) REFERENCES mine_report_submission_status_code(mine_report_submission_status_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_report_submission is 'A file submission for a code required report.';
ALTER TABLE mine_report_submission OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report_document_xref
(
    mine_report_document_xref_guid uuid    DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    mine_document_guid             uuid                              NOT NULL            ,
    mine_report_submission_id      integer                           NOT NULL            ,

    FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_report_submission_id) REFERENCES mine_report_submission(mine_report_submission_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_report_document_xref is 'Links a mine document to report submission.';
ALTER TABLE mine_report_document_xref OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report_comment (
    mine_report_comment_id           serial                                  NOT NULL PRIMARY KEY,
    mine_report_comment_guid         uuid                                    NOT NULL            ,
    mine_report_id                   integer                                 NOT NULL            ,
    mine_report_submission_id        integer                                                     ,
    report_comment                   varchar(300)                            NOT NULL            ,
    minespace_user_id                integer                                                     ,
    core_user_id                     integer                                                     ,
    comment_visibility_ind           boolean DEFAULT                         NOT NULL            ,
    create_user                      character varying(60)                   NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user                      character varying(60)                   NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL            ,

    FOREIGN KEY (mine_report_id) REFERENCES mine_report(mine_report_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_report_submission_id) REFERENCES mine_report_submission(mine_report_submission_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (core_user_id) REFERENCES core_user(core_user_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (minespace_user_id) REFERENCES minespace_user(user_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_report_comment is 'A comment on a report or report submission from a proponent or core user.';
ALTER TABLE mine_report_comment 
ADD CONSTRAINT minespace_user_id_and_core_user_id_mutually_exclusive
CHECK (
(minespace_user_id IS NULL AND core_user_id IS NOT NULL)
OR
(minespace_user_id IS NOT NULL AND core_user_id IS NULL)
);

ALTER TABLE mine_report_comment OWNER TO mds;

CREATE TABLE mine_report_category (
    mine_report_category    character varying(3)                     PRIMARY KEY,
    description              character varying(100)                  NOT NULL   ,
    display_order            smallint                                NOT NULL   ,
    active_ind               boolean DEFAULT true                    NOT NULL   ,
    create_user              character varying(60)                   NOT NULL   ,
    create_timestamp         timestamp with time zone DEFAULT now()  NOT NULL   ,
    update_user              character varying(60)                   NOT NULL   ,
    update_timestamp         timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE mine_report_category is 'Categories available for mine reports';
ALTER TABLE mine_report_category OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_report_category_xref (

    mine_report_category_xref_guid  uuid DEFAULT gen_random_uuid()    NOT NULL PRIMARY KEY,
    mine_report_definition_id       integer                           NOT NULL            ,
    mine_report_category            varchar(3)                        NOT NULL            ,

    FOREIGN KEY (mine_report_category) REFERENCES mine_report_category(mine_report_category) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_report_definition_id) REFERENCES mine_report_definition(mine_report_definition_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE mine_report_category_xref is 'Links a mine report defenition to the mine report categories that apply to it.';
ALTER TABLE mine_report_category_xref OWNER TO mds;

