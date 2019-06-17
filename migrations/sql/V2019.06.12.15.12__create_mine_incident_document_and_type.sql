CREATE TABLE IF NOT EXISTS mine_incident_document_type_code (
    mine_incident_document_type_code varchar(3)   PRIMARY KEY                       ,
    description                      varchar(50)                                    ,
    active_ind                       boolean DEFAULT true                   NOT NULL,
    create_user                      character varying(60)                  NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,
    update_user                      character varying(60)                  NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mine_incident_document_type_code OWNER TO mds;

CREATE TABLE IF NOT EXISTS mine_incident_document(
    mine_incident_document_id        serial                                  NOT NULL PRIMARY KEY,
    mine_incident_document_guid      uuid                                    NOT NULL            ,
    mine_incident_id                 integer                                 NOT NULL            ,
    mine_incident_document_type_code varchar(3)                              NOT NULL            ,
    document_name                    varchar(50)                             NOT NULL            ,
    document_manager_guid            uuid                                    NOT NULL            ,
    active_ind                       boolean                  DEFAULT true   NOT NULL            ,
    create_user                      varchar(60)                             NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL            ,
    update_user                      varchar(60)                             NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now()  NOT NULL            ,
    
    FOREIGN KEY (mine_incident_id) REFERENCES mine_incident(mine_incident_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_incident_document_type_code) REFERENCES mine_incident_document_type_code(mine_incident_document_type_code) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE mine_incident_document OWNER TO mds;



