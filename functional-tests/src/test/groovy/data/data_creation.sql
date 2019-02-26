DO $$
DECLARE

    MINE_GUID uuid = '9C1B63B6-CCFB-48B0-BE85-3CB3C5D1A276';
    PARTY_GUID1 uuid = 'f1e7a6e3-01ab-4926-9007-31db0267f589';
    PARTY_GUID2 uuid = '8d2878de-c20e-40a9-ad5f-e17730167125';
    PERMIT_GUID1 uuid = 'b38e1908-c147-4a87-bfb6-1fef9217ec6f';
    PERMIT_GUID2 uuid = 'ca2f096f-5d49-4cc3-b34f-5db850d14043';

    IDIR_USER varchar = 'bdd-test-create';

    MINE_NO varchar = 'BLAH0000';
    MINE_NAME varchar = 'MINETEST';
    MINE_LAT numeric = '48'     ;
    MINE_LONG numeric = '-125'  ;
    MINE_NOTE varchar = 'This is a test record';

    FIRST_NAME varchar ='Amine';
    MIDDLE_NAME varchar = 'M.D';
    SUR_NAME varchar ='Test';
    PHONE varchar =  '123-456-7890';
    EXT varchar = '009';
    EMAIL varchar = 'mds_test@test.com';
    EFFECTIVE_DATE date = '2017-10-31';
    MAJOR_IND boolean = True;
    REGION varchar = 'SW';


    PERMIT_NO1 varchar = 'BLAHPER-01';
    PERMIT_NO2 varchar = 'BLAHPER-02';
    ISSUE_DATE1 date = '2002-02-02';
    ISSUE_DATE2 date = '2003-03-03';

BEGIN

    INSERT INTO mine
        (mine_guid, mine_no, mine_name, mine_note, major_mine_ind, mine_region, create_user, create_timestamp, update_user, update_timestamp)
    VALUES
        (MINE_GUID, MINE_NO, MINE_NAME, MINE_NOTE, MAJOR_IND, REGION, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT);

    -- add location
    INSERT INTO mine_location
    VALUES
        (DEFAULT, MINE_GUID, MINE_LAT, MINE_LONG, DEFAULT, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT);

    -- add permit permittee
    INSERT INTO party
    VALUES
        (PARTY_GUID1, FIRST_NAME, SUR_NAME, PHONE, EXT, EMAIL, EFFECTIVE_DATE, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'PER'),
        (PARTY_GUID2, NULL      , SUR_NAME, PHONE, EXT, EMAIL, EFFECTIVE_DATE, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'ORG');

INSERT INTO permit
VALUES
    (PERMIT_GUID1,MINE_GUID,PERMIT_NO1,'C',IDIR_USER,DEFAULT,IDIR_USER,DEFAULT,DEFAULT),
    (PERMIT_GUID2,MINE_GUID,PERMIT_NO2,'O',IDIR_USER,DEFAULT,IDIR_USER,DEFAULT,DEFAULT);

    INSERT INTO mine_party_appt
        (mine_guid, party_guid, mine_party_appt_type_code, permit_guid, create_user, update_user)
    VALUES
        (MINE_GUID, PARTY_GUID1, 'PMT', PERMIT_GUID1, IDIR_USER, IDIR_USER),
        (MINE_GUID, PARTY_GUID2, 'PMT', PERMIT_GUID1, IDIR_USER, IDIR_USER);

END
$$;
