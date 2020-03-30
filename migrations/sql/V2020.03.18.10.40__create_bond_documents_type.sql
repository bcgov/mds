CREATE TABLE bond_document_type(
    bond_document_type_code          varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE bond_document_type OWNER TO mds;
COMMENT ON TABLE bond_document_type IS 'Contains a list of documents related to bonds used by the Ministry. Examples of Bond document types may include; Scan of Reclamation Security Bond, Release of Security Form, Confiscation of Security Form.';
