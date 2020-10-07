UPDATE bond_document_type set description = 'No Interest Payable Form' where bond_document_type_code = 'NIA';
DELETE FROM bond_document_type WHERE bond_document_type_code = 'BAL';

CREATE TABLE IF NOT EXISTS bond_document_xref
(
    mine_document_id            uuid        PRIMARY KEY       NOT NULL,
    bond_document_type_code     varchar(3)                    NOT NULL,
    bond_id                     integer                       NOT NULL,                                           

    FOREIGN KEY (mine_document_id) REFERENCES mine_document(mine_document_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (bond_document_type_code) REFERENCES bond_document_type(bond_document_type_code),
    FOREIGN KEY (bond_id) REFERENCES bond(bond_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE bond_document_xref is 'Links a mine document to bond documents.';
ALTER TABLE bond_document_xref OWNER TO mds;

CREATE TABLE IF NOT EXISTS reclamation_invoice_document_xref
(
    mine_document_id            integer       PRIMARY KEY                    NOT NULL,         
    reclamation_invoice_id      integer                                      NOT NULL,                  

    FOREIGN KEY (mine_document_id) REFERENCES mine_document(mine_document_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (reclamation_invoice_id) REFERENCES reclamation_invoice(reclamation_invoice_id) DEFERRABLE INITIALLY DEFERRED
);

COMMENT ON TABLE reclamation_invoice_document_xref is 'Links a mine document to reclamation invoice document.';
ALTER TABLE reclamation_invoice_document_xref OWNER TO mds;

-- ALTER TABLE mine_document
-- DROP CONSTRAINT mine_document_bond_document_type_fk,
-- DROP CONSTRAINT mine_document_bond_id_fk,
-- DROP COLUMN bond_id,
-- DROP COLUMN bond_document_type_code,
-- DROP CONSTRAINT reclamation_invoice_id_fk,
-- DROP COLUMN reclamation_invoice_id;