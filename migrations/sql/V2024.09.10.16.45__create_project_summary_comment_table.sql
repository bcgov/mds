CREATE TABLE IF NOT EXISTS project_summary_ministry_comment
(
    project_summary_ministry_comment_guid uuid                     DEFAULT gen_random_uuid() PRIMARY KEY,
    project_summary_guid                  uuid                                   NOT NULL,
    content                               character varying(300)                 NOT NULL,
    deleted_ind                           boolean                  DEFAULT false NOT NULL,
    create_user                           character varying(60)                  NOT NULL,
    create_timestamp                      timestamp with time zone DEFAULT now() NOT NULL,
    update_user                           character varying(60)                  NOT NULL,
    update_timestamp                      timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT project_summary_guid_fkey FOREIGN KEY (project_summary_guid) REFERENCES project_summary (project_summary_guid)
);

COMMENT ON TABLE project_summary_ministry_comment is 'Internal Ministry Comments for a project summary';
ALTER TABLE project_summary_ministry_comment
    OWNER TO mds;