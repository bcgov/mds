CREATE TABLE IF NOT EXISTS mine_comment (
    mine_comment_id           serial                                  NOT NULL PRIMARY KEY,
    mine_comment_guid         uuid DEFAULT gen_random_uuid()   UNIQUE NOT NULL            ,
    mine_guid                 uuid                                    NOT NULL            ,
    mine_comment              varchar                                 NOT NULL            ,
    comment_user              varchar                                 NOT NULL            ,
    comment_datetime          timestamp with time zone DEFAULT now()  NOT NULL            ,
    deleted_ind               boolean DEFAULT false                   NOT NULL            ,
    create_user               character varying(60)                   NOT NULL            ,
    create_timestamp          timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user               character varying(60)                   NOT NULL            ,
    update_timestamp          timestamp with time zone DEFAULT now()  NOT NULL            ,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED
);