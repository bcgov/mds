ALTER TABLE mine_document add column mine_document_id SERIAL NOT NULL;
ALTER TABLE mine_document add column document_class varchar;
ALTER TABLE mine_document ADD CONSTRAINT unique_mine_document_id UNIQUE (mine_document_id);

CREATE TABLE bond_document (
    mine_document_id integer PRIMARY KEY,
    bond_id integer NOT NULL,

    FOREIGN KEY (mine_document_id) REFERENCES mine_document(mine_document_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (bond_id) REFERENCES bond(bond_id) DEFERRABLE INITIALLY DEFERRED
);
