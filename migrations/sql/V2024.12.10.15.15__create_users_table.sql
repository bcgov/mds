CREATE TABLE "user"
(
    sub               VARCHAR PRIMARY KEY,
    email             VARCHAR                                NOT NULL,
    given_name        VARCHAR                                NOT NULL,
    family_name       VARCHAR                                NOT NULL,
    display_name      VARCHAR                                NOT NULL,
    idir_username     VARCHAR                                NOT NULL,
    identity_provider VARCHAR                                NOT NULL,
    idir_user_guid    VARCHAR                                NOT NULL,
    last_logged_in    TIMESTAMPTZ,
    create_user       VARCHAR(255)                           NOT NULL,
    create_timestamp  timestamp with time zone DEFAULT now() NOT NULL,
    update_user       VARCHAR(255)                           NOT NULL,
    update_timestamp  timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind       BOOLEAN                  DEFAULT false
);

ALTER TABLE "user"
    OWNER TO mds;

--
-- Name: TABLE user; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE "user" IS 'User Profile data sourced from keycloak';