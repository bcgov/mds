--  Migrate MINE MANAGER (first name, last name)
-- Dependency: ETL_MINE table

DO $$
DECLARE
    old_row   integer   ;
    new_row   integer   ;
BEGIN
    RAISE NOTICE 'Start updating mine manager:';
    RAISE NOTICE '.. Step 1 of 3: Scan new managers in MMS';
    -- This is the intermediary table that will be used to store mine manager profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_MANAGER(
        mine_guid   uuid                ,
        mine_no     varchar(7)          ,
        party_guid  uuid                ,
        first_name  varchar(100)        ,
        surname     varchar(100)        ,
        phone_no    varchar(12)         ,
        email       varchar(254)        ,
        effective_date      date        ,
        person_combo_id     varchar(600),
        mgr_combo_id        varchar(600)
    );
    SELECT count(*) FROM ETL_MANAGER into old_row;

    --1. Mine with valid manager attached

    --Step 1: Get regional mine_no's
    WITH regional_mine AS (
        SELECT mine_no
        FROM mms.mmsmin
        WHERE (min_lnk = 'N' OR min_lnk is null)
    ),

    --Step 2, Get most recent NOW 
    latest_now AS (
        SELECT n.mine_no mine_no, Max(n.cid) cid
        FROM mms.mmsnow n
        WHERE n.mine_no in (SELECT mine_no from regional_mine)
        GROUP BY n.mine_no
    ),
     --Step 3, get contact connection that is a Mine Manager
    latest_now_ccc AS ( --contact connection
        SELECT latest_now.mine_no mine_no, latest_now.cid cid, ccc.cid_ccn contact_cid
        FROM mms.mmsccc ccc 
        LEFT JOIN latest_now ON latest_now.cid = ccc.cid
        WHERE SubStr(ccc.type_ind,3,1) = 'Y'
        AND ccc.cid in (SELECT cid from latest_now)
    ),
    -- Step 4, get contact from contact connection
    new_manager AS (
        SELECT latest_now_ccc.mine_no mine_no, cn.cid person_combo_id, latest_now_ccc.mine_no||cn.cid as mgr_combo_id
        FROM mms.mmsccn cn
        LEFT JOIN latest_now_ccc ON latest_now_ccc.contact_cid = cn.cid   
        WHERE cn.cid in (SELECT contact_cid from latest_now_ccc)
    ),

    --5. Check if manager is a new person
    new_person AS (
        SELECT DISTINCT ON (person_combo_id)
            person_combo_id
        FROM new_manager
        WHERE person_combo_id NOT IN (
            SELECT  person_combo_id
            FROM    ETL_Manager
        )
    ),
    --6. Extract contact info and formatting
    new_person_info AS(
        SELECT
            cid AS person_combo_id  ,
            COALESCE(NULLIF(regexp_replace(contact_info.name,' ', '', 'g'),''),'Unknown') first_name,
            COALESCE(NULLIF(regexp_replace(contact_info.l_name,' ', '', 'g'),''),'Unknown') surname ,
            NULLIF(regexp_replace(phone, '\D', '','g'),'')::numeric phone_no                        , --Extract numbers only from phone_no field
            COALESCE(NULLIF(regexp_replace(contact_info.email,' ', '', 'g'),''),'Unknown') email    ,
            COALESCE(contact_info.add_dt,now()) effective_date --add_dt is the date the record was last updated... maybe not best date for effective date. maybe use mmsnow.entered_date
        FROM mms.mmsccn contact_info
        WHERE cid IN (
            SELECT  person_combo_id
            FROM    new_person
        )
    ),
    -- Remove the extra digit in phone number
    new_person_info_get_phone AS(
        SELECT
            gen_random_uuid() AS party_guid   ,
            person_combo_id                   ,
            first_name                        ,
            surname                           ,
            CASE
                WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar--Remove country code for phone_no
                WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                ELSE 'Unknown'
            END AS phone_no ,
            email           ,
            effective_date
        FROM new_person_info
    ),
    --Format phone number field to match MDS party table schema
    new_person_info_format_phone AS (
        SELECT
            party_guid      ,
            person_combo_id ,
            first_name      ,
            surname         ,
            CASE
                WHEN phone_no = 'Unknown' THEN phone_no
                ELSE
                    SUBSTRING(phone_no from 1 for 3)||'-'||
                    SUBSTRING(phone_no from 4 for 3)||'-'||
                    SUBSTRING(phone_no from 7 for 4)
            END AS phone_no ,
            email           ,
            effective_date
        FROM new_person_info_get_phone
    ),
    --7. Complete list of person info for new manager record
    person_info AS (
        SELECT * FROM new_person_info_format_phone
        UNION
        SELECT
            party_guid      ,
            person_combo_id ,
            first_name      ,
            surname         ,
            phone_no        ,
            email           ,
            effective_date
        FROM ETL_MANAGER
        WHERE   person_combo_id IN (
            SELECT  DISTINCT person_combo_id
            FROM    new_manager
        )
    ),
    --8. Complete list of new regional mine manager
    new_manager_info AS (
        SELECT
            manager.mine_no         ,
            manager.person_combo_id ,
            manager.mgr_combo_id    ,
            person.party_guid       ,
            person.first_name       ,
            person.surname          ,
            person.phone_no         ,
            person.email            ,
            person.effective_date
        FROM new_manager manager
        INNER JOIN person_info person   ON
            person.person_combo_id=manager.person_combo_id
    )
    INSERT INTO ETL_MANAGER (
        mine_guid               ,
        mine_no                 ,
        party_guid              ,
        first_name              ,
        surname                 ,
        phone_no                ,
        email                   ,
        effective_date          ,
        person_combo_id         ,
        mgr_combo_id            )
    SELECT
        mds.mine_guid           ,
        mms.mine_no             ,
        mms.party_guid          ,
        mms.first_name          ,
        mms.surname             ,
        mms.phone_no            ,
        mms.email               ,
        mms.effective_date      ,
        mms.person_combo_id     ,
        mms.mgr_combo_id
    FROM new_manager_info mms
    INNER JOIN ETL_MINE mds ON mds.mine_no = mms.mine_no;
    SELECT count(*) FROM ETL_MANAGER INTO new_row;
    RAISE NOTICE '.... # of new manager records loaded into MDS: %', (new_row-old_row);
END $$;




DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 3: Update contact details for new person';
    SELECT count(*) FROM party INTO old_row;
    WITH
    --Select only new entry in ETL_Manager table
    new_manager AS(
        SELECT DISTINCT ON (party_guid)
            party_guid     ,
            first_name     ,
            surname        ,
            phone_no       ,
            email          ,
            effective_date
        FROM ETL_MANAGER
        WHERE party_guid NOT IN (
            SELECT  party_guid
            FROM    party
        )
    )
    INSERT INTO party(
        party_guid      ,
        first_name      ,
        party_name      ,
        phone_no        ,
        phone_ext       ,
        email           ,
        effective_date  ,
        expiry_date     ,
        create_user     ,
        create_timestamp,
        update_user     ,
        update_timestamp,
        party_type_code
    )
    SELECT
        party_guid          ,
        first_name          ,
        surname             ,
        phone_no            ,
        'N/A'               ,
        email               ,
        effective_date      ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()               ,
        'PER'
    FROM new_manager;
    SELECT count(*) FROM party INTO new_row;
    RAISE NOTICE '.... # new person records MMS: %', (new_row-old_row);
    RAISE NOTICE '.... Total person records MMS: %', (new_row);
END $$;

DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 3 of 3: Update mine manager assignment';
    SELECT count(*) FROM mine_party_appt INTO old_row;
    --select only new record
    WITH new_manager AS
    (
        SELECT *
        FROM ETL_MANAGER
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mine_party_appt
            WHERE
                party_guid = ETL_MANAGER.party_guid
            AND
                mine_guid = ETL_Manager.mine_guid
            AND
                mine_party_appt_type_code = 'MMG'
        )
    )
    INSERT INTO mine_party_appt(
        mine_party_appt_guid,
        mine_guid           ,
        party_guid          ,
        mine_party_appt_type_code,
        start_date          ,
        end_date            ,
        create_user         ,
        create_timestamp    ,
        update_user         ,
        update_timestamp
    )
    SELECT
        gen_random_uuid()   ,-- Generate a random UUID for mgr_appointment_guid
        new.mine_guid       ,
        new.party_guid      ,
        'MMG'               ,
        new.effective_date  ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_manager new;
    SELECT count(*) FROM mine_party_appt INTO new_row;
    RAISE NOTICE '.... # new manager assignment: %', (new_row-old_row);
    RAISE NOTICE '.... Total mine reords with manager information: %', (new_row);
    RAISE NOTICE 'Finish updating mine manager.';
END $$;
