ALTER TABLE mine_document add column mine_document_id SERIAL NOT NULL;
ALTER TABLE mine_document add column bond_id integer;
ALTER TABLE mine_document ADD CONSTRAINT mine_document_bond_id_fk FOREIGN KEY bond(bond_id);
ALTER TABLE mine_document ADD CONSTRAINT unique_mine_document_id UNIQUE (mine_document_id);