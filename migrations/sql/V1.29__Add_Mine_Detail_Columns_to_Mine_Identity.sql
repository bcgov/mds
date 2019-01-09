ALTER TABLE mine_identity
    ADD COLUMN mine_no character varying(10) NOT NULL DEFAULT '',
    ADD COLUMN mine_name character varying(60) NOT NULL DEFAULT '' ,
    ADD COLUMN mine_note character varying(300) NOT NULL DEFAULT '',
    ADD COLUMN major_mine_ind boolean NOT NULL DEFAULT FALSE,
    ADD COLUMN mine_region character varying(2),
    ADD COLUMN deleted_ind boolean NOT NULL DEFAULT FALSE,
    ADD FOREIGN KEY(mine_region) REFERENCES mine_region_code(mine_region_code);