CREATE TABLE subscription
(
    subscription_id serial PRIMARY KEY,
    user_name character varying(60) NOT NULL,
    mine_guid uuid NOT NULL,

    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid),
    CONSTRAINT unq_user_name_mine_guid UNIQUE(user_name,mine_guid)
);
ALTER TABLE subscription OWNER TO mds;
COMMENT ON TABLE subscription IS 'A list of mds mines a given core user has subscribed to';