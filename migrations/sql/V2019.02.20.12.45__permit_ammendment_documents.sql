CREATE TABLE permit_ammendment_document_xref (
    permit_ammendment_document_xref_id serial PRIMARY KEY,
    mine_document_guid uuid NOT NULL,
    permit_ammendment_id integer NOT NULL,
    
    FOREIGN KEY (permit_ammendment_id) REFERENCES permit_amendment(permit_amendment_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_document_guid) REFERENCES mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED
);


ALTER TABLE mine_expected_document_xref OWNER TO mds;