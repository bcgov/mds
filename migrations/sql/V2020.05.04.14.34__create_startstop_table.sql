CREATE TABLE IF NOT EXISTS now_submissions.application_start_stop_json (
    messageid	              serial                                  NOT NULL PRIMARY KEY,
    messagebody               varchar                                 NOT NULL            ,
    create_user               character varying(60)                   NOT NULL            ,
    create_timestamp          timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user               character varying(60)                   NOT NULL            ,
    update_timestamp          timestamp with time zone DEFAULT now()  NOT NULL            
);