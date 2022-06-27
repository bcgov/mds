CREATE TABLE IF NOT EXISTS information_requirements_table_document_type (
    information_requirements_table_document_type_code         character varying(3)                 PRIMARY KEY,
    description                                               character varying(100)                  NOT NULL,
    display_order                                             smallint                                NOT NULL,
    active_ind                                                boolean DEFAULT true                    NOT NULL,
    create_user                                               character varying(60)                   NOT NULL,
    create_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                                               character varying(60)                   NOT NULL,
    update_timestamp                                          timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE information_requirements_table_document_type is 'All the possible and available document types for Information Requirements Table (IRT).';
ALTER TABLE information_requirements_table_document_type OWNER TO mds;

INSERT INTO information_requirements_table_document_type(information_requirements_table_document_type_code, description, display_order, create_user, update_user)
VALUES ('TEM', 'Template', 10, 'system-mds', 'system-mds');

CREATE TABLE IF NOT EXISTS information_requirements_table_document_xref (
    information_requirements_table_document_xref_guid         uuid DEFAULT gen_random_uuid()       PRIMARY KEY,
    mine_document_guid                                        uuid                                    NOT NULL,
    irt_id                                                    smallint                                NOT NULL,
    information_requirements_table_document_type_code         character varying(3)                    NOT NULL,

    CONSTRAINT information_requirements_table_document_xref_guid UNIQUE (information_requirements_table_document_xref_guid),
    CONSTRAINT mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT irt_id_fkey FOREIGN KEY (irt_id) REFERENCES information_requirements_table(irt_id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT information_requirements_table_document_type_code_fkey FOREIGN KEY (information_requirements_table_document_type_code) REFERENCES information_requirements_table_document_type(information_requirements_table_document_type_code) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE information_requirements_table_document_xref is 'Links mine documents to Information Requirements Table (IRT).';
ALTER TABLE information_requirements_table_document_xref OWNER TO mds;