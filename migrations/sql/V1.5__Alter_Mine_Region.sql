DROP TABLE IF EXISTS mine_region;

ALTER TABLE mine_region_code
    ADD effective_date date NOT NULL DEFAULT now(),
    ADD expiry_date date NOT NULL DEFAULT '9999-12-31'::date
;

ALTER TABLE mine_region_code RENAME region_code TO mine_region_code;

ALTER TABLE mine_detail
    ADD mine_region character varying(2),
    ADD FOREIGN KEY(mine_region) REFERENCES mine_region_code(mine_region_code)
;