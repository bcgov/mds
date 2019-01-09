

ALTER TABLE public.mine_party_appt drop active_ind;
ALTER TABLE public.mine_party_appt add deleted_ind boolean NOT NULL DEFAULT 'false' ;
ALTER TABLE public.mine_party_appt DROP CONSTRAINT mine_party_appt_permit_fk;
ALTER TABLE permit ADD CONSTRAINT mine_permit_guid_unique UNIQUE (permit_guid, mine_guid);
ALTER TABLE public.mine_party_appt ADD CONSTRAINT mine_party_appt_permit_party_fk FOREIGN KEY (permit_guid,mine_guid) REFERENCES permit(permit_guid,mine_guid);


ALTER TABLE public.mine_party_appt_type_code add person boolean NOT NULL DEFAULT 'false' ;
ALTER TABLE public.mine_party_appt_type_code add organization boolean NOT NULL DEFAULT 'false' ;
ALTER TABLE public.mine_party_appt_type_code add grouping_level int4 NOT NULL DEFAULT '1' ;
COMMIT;

INSERT INTO mine_party_appt_type_code
    (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
    )
VALUES
    ('MMG', 'Mine Manager', 1, 'system-mds', 'system-mds', 'true', 'false', 3),
    ('PMT', 'Permittee', 2, 'system-mds', 'system-mds', 'true', 'true', 3),
    ('MOR', 'Mine Operator', 3, 'system-mds', 'system-mds', 'true', 'true', 3),
    ('MOW', 'Mine Owner', 4, 'system-mds', 'system-mds', 'true', 'true', 3),
    ('EOR', 'Engineer Of Record', 5, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('EVS', 'Environmental Specialist', 6, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('EMM', 'Exploration Mine Manager', 7, 'system-mds', 'system-mds', 'true', 'false', 2),
    ('SVR', 'Supervisor', 8, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('SHB', 'Shift Boss', 9, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('FRB', 'Fire Boss', 10, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('BLA', 'Blaster', 11, 'system-mds', 'system-mds', 'true', 'false', 1),
    ('MRC', 'Mine Rescue Contact', 12, 'system-mds', 'system-mds', 'true', 'false', 1)
ON CONFLICT DO NOTHING;
COMMIT;

UPDATE mine_party_appt_type_code SET display_order=1, person='true', organization='false', grouping_level=3 WHERE mine_party_appt_type_code='MMG';
UPDATE mine_party_appt_type_code SET display_order=2, person='true', organization='true',  grouping_level=3 WHERE mine_party_appt_type_code='PMT';
UPDATE mine_party_appt_type_code SET display_order=3, person='true', organization='true', grouping_level=3 WHERE mine_party_appt_type_code='MOR';
UPDATE mine_party_appt_type_code SET display_order=4, person='true', organization='true', grouping_level=3 WHERE mine_party_appt_type_code='MOW';
UPDATE mine_party_appt_type_code SET display_order=5, person='true', organization='false', grouping_level=2 WHERE mine_party_appt_type_code='EOR';
UPDATE mine_party_appt_type_code SET display_order=6, person='true', organization='false', grouping_level=2 WHERE mine_party_appt_type_code='EVS';
UPDATE mine_party_appt_type_code SET display_order=7, person='true', organization='false', grouping_level=2 WHERE mine_party_appt_type_code='EMM';
UPDATE mine_party_appt_type_code SET display_order=8, person='true', organization='false', grouping_level=1 WHERE mine_party_appt_type_code='SVR';
UPDATE mine_party_appt_type_code SET display_order=9, person='true', organization='false', grouping_level=1 WHERE mine_party_appt_type_code='SHB';
UPDATE mine_party_appt_type_code SET display_order=10, person='true', organization='false', grouping_level=1 WHERE mine_party_appt_type_code='FRB';
UPDATE mine_party_appt_type_code SET display_order=11, person='true', organization='false', grouping_level=1 WHERE mine_party_appt_type_code='BLA';
UPDATE mine_party_appt_type_code SET display_order=12, person='true', organization='false', grouping_level=1 WHERE mine_party_appt_type_code='MRC';
COMMIT;
