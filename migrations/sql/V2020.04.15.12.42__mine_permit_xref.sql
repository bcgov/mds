CREATE TABLE mine_permit_xref (
    mine_guid uuid NOT NULL,
    permit_id integer NOT NULL,

    PRIMARY KEY(mine_guid, permit_id),

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED
);


INSERT INTO mine_permit_xref
SELECT m.mine_guid, p.permit_id from mine m
inner join permit p on m.mine_guid = p.mine_guid 