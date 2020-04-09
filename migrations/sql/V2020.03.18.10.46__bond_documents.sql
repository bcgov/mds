ALTER TABLE mine_document add column mine_document_id SERIAL NOT NULL;
ALTER TABLE mine_document add column bond_id integer;
ALTER TABLE mine_document add column document_class varchar;
ALTER TABLE mine_document add column bond_document_type_code varchar;
ALTER TABLE mine_document ADD CONSTRAINT mine_document_bond_document_type_fk FOREIGN KEY (bond_document_type_code) REFERENCES bond_document_type(bond_document_type_code);
ALTER TABLE mine_document ADD CONSTRAINT mine_document_bond_id_fk FOREIGN KEY (bond_id) REFERENCES bond(bond_id);
ALTER TABLE mine_document ADD CONSTRAINT unique_mine_document_id UNIQUE (mine_document_id);
