DO $$
DECLARE

    MINE_GUID uuid = '4afafc66-d294-4765-b5c8-8eb77630cb56';
    PARTY_GUID1 uuid = 'f1e7a6e3-01ab-4926-9007-31db0267f589';
    PARTY_GUID2 uuid = '8d2878de-c20e-40a9-ad5f-e17730167125';
    PERMIT_GUID1 uuid = 'b38e1908-c147-4a87-bfb6-1fef9217ec6f';
    PERMIT_GUID2 uuid = 'ca2f096f-5d49-4cc3-b34f-5db850d14043';

    IDIR_USER varchar = 'bdd-test-create';

    MINE_NO varchar = 'BLAH0000';
    MINE_NAME varchar = '!!MINETEST';
    MINE_LAT numeric = '52.1'     ;
    MINE_LONG numeric = '-125'  ;
    MINE_NOTE varchar = 'This is a test record';

    MINE_GUID_2 uuid = '3877d66a-44c1-4685-a679-5d1473fae9de';
    MINE_NO_2 varchar = 'BLAH0002';
    MINE_NAME_2 varchar = '!!MINE2TEST';
    MINE_LAT_2 numeric = '53.2'     ;
    MINE_LONG_2 numeric = '-126.2'  ;
    MINE_NOTE_2 varchar = 'This is a test record for contacts test';

    FIRST_NAME varchar ='Amine';
    MIDDLE_NAME varchar = 'M.D';
    SUR_NAME varchar ='Test';
    PHONE varchar =  '123-456-7890';
    EXT varchar = '009';
    EMAIL varchar = 'mds_test@test.com';
    EFFECTIVE_DATE date = '2017-10-31';
    MAJOR_IND boolean = True;
    REGION varchar = 'SW';


    PARTY_GUID3 uuid = '9fa4739f-b400-4ab0-af2c-7a1280f5d043';
    FIRST_NAME3 varchar ='Halfthor';
    SUR_NAME3 varchar ='Zavicus';
    PHONE3 varchar =  '111-222-3333';
    EXT3 varchar =  '007';
    EMAIL3 varchar =  'test@blah.do';
    EFFECTIVE_DATE3 date =  '2018-02-22';

    PARTY_GUID4 uuid = 'e391c5bb-78de-4097-87bf-198766c0087b';
    FIRST_NAME4 varchar ='Halfthor';
    SUR_NAME4 varchar ='Bjornson';
    PHONE4 varchar =  '333-444-5555';
    EXT4 varchar =  '004';
    EMAIL4 varchar =  'habit@canada.us';
    EFFECTIVE_DATE4 date =  '2019-01-01';


    PERMIT_NO1 varchar = 'BLAHPER-01';
    PERMIT_NO2 varchar = 'BLAHPER-02';
    ISSUE_DATE1 date = '2002-02-02';
    ISSUE_DATE2 date = '2003-03-03';

BEGIN

    INSERT INTO mine
        (mine_guid, mine_no, mine_name, mine_note, major_mine_ind, mine_region, create_user, create_timestamp, update_user, update_timestamp, latitude, longitude)
    VALUES
        (MINE_GUID, MINE_NO, MINE_NAME, MINE_NOTE, MAJOR_IND, REGION, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MINE_LAT, MINE_LONG);

    INSERT INTO mine
        (mine_guid, mine_no, mine_name, mine_note, major_mine_ind, mine_region, create_user, create_timestamp, update_user, update_timestamp, latitude, longitude)
    VALUES
        (MINE_GUID_2, MINE_NO_2, MINE_NAME_2, MINE_NOTE_2, MAJOR_IND, REGION, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MINE_LAT_2, MINE_LONG_2);

    -- add permit permittee and other parties
    INSERT INTO party
    VALUES
        (PARTY_GUID3, FIRST_NAME3, SUR_NAME3, PHONE3, EXT3, EMAIL3, EFFECTIVE_DATE3, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'PER'),
        (PARTY_GUID4, FIRST_NAME4, SUR_NAME4, PHONE4, EXT4, EMAIL4, EFFECTIVE_DATE4, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'PER'),
        (PARTY_GUID1, FIRST_NAME, SUR_NAME, PHONE, EXT, EMAIL, EFFECTIVE_DATE, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'PER'),
        (PARTY_GUID2, NULL      , SUR_NAME, PHONE, EXT, EMAIL, EFFECTIVE_DATE, DEFAULT, IDIR_USER, DEFAULT, IDIR_USER, DEFAULT, MIDDLE_NAME, 'ORG');

END
$$;
