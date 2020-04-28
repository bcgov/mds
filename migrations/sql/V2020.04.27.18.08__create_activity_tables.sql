
CREATE TABLE core_activity_verb (
    core_activity_verb_code          varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE core_activity_verb OWNER TO mds;

CREATE TABLE core_activity_object_type (
    core_activity_object_type_code   varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE core_activity_object_type OWNER TO mds;


CREATE TABLE IF NOT EXISTS core_activity (
    core_activity_id                                                 SERIAL PRIMARY KEY,
    core_activity_verb_code          varchar                                   NOT NULL,
    published_date                   timestamp with time zone DEFAULT now()    NOT NULL,
    title                            varchar                                   NOT NULL,
    actor_guid                       uuid                                      NOT NULL,
    actor_object_type_code           varchar                                   NOT NULL,
    object_guid                      uuid                                      NOT NULL,
    object_object_type_code          varchar                                   NOT NULL,
    target_guid                      uuid                                      NOT NULL,
    target_object_type_code          varchar                                   NOT NULL,

    FOREIGN KEY (core_activity_verb_code) REFERENCES core_activity_verb(core_activity_verb_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (actor_object_type_code) REFERENCES core_activity_object_type(core_activity_object_type_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (object_object_type_code) REFERENCES core_activity_object_type(core_activity_object_type_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (target_object_type_code) REFERENCES core_activity_object_type(core_activity_object_type_code) DEFERRABLE INITIALLY DEFERRED
);
ALTER TABLE core_activity OWNER TO mds;




INSERT INTO core_activity_verb
    (
    core_activity_verb_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('ADD', 'added', 'system-mds', 'system-mds'),
    ('MOD', 'modified', 'system-mds', 'system-mds'),
    ('DEL', 'deleted', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;


INSERT INTO core_activity_object_type
    (
    core_activity_object_type_code,
    description,
    create_user,
    update_user
    )
VALUES
    ('USR', 'user', 'system-mds', 'system-mds'),
    ('CRR', 'code-required report', 'system-mds', 'system-mds'),
    ('MIN', 'mine', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

