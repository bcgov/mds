CREATE TABLE IF NOT EXISTS mine_commodity_tenure_type
(
    mine_commodity_code                 character varying(2)    NOT NULL,
    mine_tenure_type_code               character varying(3)    NOT NULL,

    PRIMARY KEY(mine_commodity_code, mine_tenure_type_code),

    FOREIGN KEY (mine_commodity_code) REFERENCES mine_commodity_code(mine_commodity_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_tenure_type_code) REFERENCES mine_tenure_type_code(mine_tenure_type_code) DEFERRABLE INITIALLY DEFERRED
);
