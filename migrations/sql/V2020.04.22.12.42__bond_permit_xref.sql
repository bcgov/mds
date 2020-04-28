CREATE TABLE bond_permit_xref (
    bond_id integer NOT NULL,
    permit_id integer NOT NULL,

    PRIMARY KEY(bond_id, permit_id),

    FOREIGN KEY (bond_id) REFERENCES bond(bond_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED
);
-- this exists to hand permits that were resued on multiple mines, 
-- Permit number is the grouping that this table should work on

ALTER TABLE bond_permit_xref OWNER TO mds;
