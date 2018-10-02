-- 2. Migrate MINE MANAGER (first name, last name)
--Create the ETL_PROFILE table

DO $$
DECLARE 
    old_row   integer;
    new_row   integer;
BEGIN 
    RAISE NOTICE 'Start updating mine manager:';
    RAISE NOTICE '.. Step 1 of 3: Scan new managers in MMS';
    -- This is the intermediary table that will be used to store mine manager profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_MANAGER(
        mine_guid   uuid        ,
        mine_no     varchar(7)  ,
        party_guid uuid        ,
        first_name  varchar(100),
        surname     varchar(100),
        phone_no    varchar(12),
        email       varchar(254),
        effective_date      date NOT NULL DEFAULT now(),
        person_combo_id     varchar(600),
        mgr_combo_id        varchar(600)
    );
    SELECT count(*) FROM ETL_MANAGER into old_row;
    WITH 
    --List of NoW (Notice Of Work) whose attached contact is a Mine Manager;
    now_wContact AS(
        SELECT
            nowlist.mine_no,
            nowlist.upd_no,
            nowlist.cid,
            now_contact.cid_ccn
        FROM mms.mmsnow nowlist
        INNER JOIN mms.mmsccc now_contact ON
            nowlist.cid = now_contact.cid
            AND
            --If the 3rd letter in type_ind is 'Y', possibly denoting the contact is a Mine Manager
            SUBSTRING(now_contact.type_ind, 3, 1) = 'Y'
    ),
    --Sublist of 'now_wContact' selecting only the latest record for each mine based on 'upd_no'
    latest_now AS(
        SELECT
            now_wContact.mine_no,
            Max(upd_no) last_upd
        FROM now_wContact
        GROUP BY
            now_wContact.mine_no
    ),
    --Select the most recent NoW for each mine in now_wContact; 
    latest_now_wContact AS(
        --This list may contain more than 1 cid_ccn (contact ref id) if more than 1 manager are listed in a single NoW
        SELECT
            nowlist.mine_no,
            nowlist.upd_no,
            nowlist.cid,
            nowlist.cid_ccn 
        FROM now_wContact nowlist
        INNER JOIN latest_now ON 
            latest_now.last_upd = nowlist.upd_no
            AND
            latest_now.mine_no = nowlist.mine_no
    ),
    --Sublist of `latest_now_wContact` selecting only one manager contact based on `cid_ccn`
    manager_selection AS(
        SELECT
            cid,
            max(cid_ccn) contact_ref
        FROM latest_now_wContact
        GROUP BY cid
    ),
    --Retrieve mine manager ref id for each mine
    manager_ref_list AS(    
        SELECT
            latest_now.mine_no,
            manager_selection.contact_ref
        FROM manager_selection
        INNER JOIN latest_now_wContact latest_now ON
            manager_selection.contact_ref=latest_now.cid_ccn
            AND
            manager_selection.cid=latest_now.cid
    ),
    --Extract only the numbers in phone info field
    phone_format AS(
        SELECT 
            cid,
            NULLIF(regexp_replace(phone, '\D', '','g'),'')::numeric phone_no
        FROM mms.mmsccn
    ),
    --Format bad phone data
    good_phone AS(
        SELECT
            cid,
            CASE 
                WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar--Remove country code for phone_no
                WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                ELSE 'Unknown'
            END AS good_phone_no
        FROM phone_format 
    ),
    --Retrieve contact details and format data from MMS 
    manager_info AS (
        SELECT
            manager_ref_list.mine_no,
            COALESCE(NULLIF(regexp_replace(contact_info.name,' ', '', 'g'),''),'Unknown') first_name,
            COALESCE(NULLIF(regexp_replace(contact_info.l_name,' ', '', 'g'),''),'Unknown') surname, 
            CASE 
                WHEN good_phone.good_phone_no = 'Unknown' THEN good_phone.good_phone_no
                ELSE
                    SUBSTRING(good_phone.good_phone_no from 1 for 3)||'-'||
                    SUBSTRING(good_phone.good_phone_no from 4 for 3)||'-'||
                    SUBSTRING(good_phone.good_phone_no from 7 for 4) 
            END AS phone_no, 
            COALESCE(NULLIF(regexp_replace(contact_info.email,' ', '', 'g'),''),'Unknown') email,     
            COALESCE(contact_info.add_dt,now()) effective_date
        FROM manager_ref_list
        INNER JOIN mms.mmsccn contact_info ON
            contact_info.cid = manager_ref_list.contact_ref
        INNER JOIN good_phone ON
            good_phone.cid=contact_info.cid
    ),
    --Getting mine guid into manager table by matching mine_no
    mms_manager  AS(
        SELECT
            mine_detail.mine_no     ,
            mine_detail.mine_guid   ,
            manager_info.first_name ,
            manager_info.surname    ,
            manager_info.phone_no   ,
            manager_info.email      ,
            manager_info.effective_date,
            UPPER(manager_info.first_name||manager_info.surname||manager_info.phone_no||manager_info.email) AS person_combo_id,
            UPPER(manager_info.first_name||manager_info.surname||manager_info.phone_no||manager_info.email||manager_info.mine_no) AS mgr_combo_id
        FROM mine_detail 
        INNER JOIN manager_info ON
            mine_detail.mine_no=manager_info.mine_no
    ),

 
 
    -- Select a list of new manager record that will be added to the etl table
    new_mms_manager AS(
        SELECT *
        FROM mms_manager 
        WHERE NOT EXISTS (
            SELECT 1
            FROM ETL_Manager
            WHERE 
                mgr_combo_id = mms_manager.mgr_combo_id
        ) 
    ),
    -- Select a list of distinct person from the new record list
    distinct_person AS (
        SELECT DISTINCT 
            person_combo_id
        FROM 
            new_mms_manager
    ),
    -- List of person already exists in MDS person table
    distinct_person_old AS(
        SELECT *
        FROM distinct_person
        WHERE EXISTS (
            SELECT 1
            FROM party
            WHERE 
                UPPER(party.first_name||party.party_name||party.phone_no||party.email) = distinct_person.person_combo_id
        )
    ),
    -- Get person guid from MDS person table
    distinct_person_old_wGuid AS (
        SELECT
            party.party_guid,
            mms_distinct.person_combo_id
        FROM
            distinct_person_old mms_distinct
        INNER JOIN party ON
            UPPER(party.first_name||party.party_name||party.phone_no||party.email) = mms_distinct.person_combo_id
    ),
    -- List of person that does not exist in MDS ETL table
    distinct_person_new AS (
        SELECT *
        FROM distinct_person
        WHERE NOT EXISTS (
            SELECT 1
            FROM ETL_Manager
            WHERE 
                person_combo_id = distinct_person.person_combo_id
        )
    ),
    -- Assign randomly generated GUID 
    distinct_person_new_wGuid AS (
        SELECT
            gen_random_uuid() party_guid,
            person_combo_id
        FROM
            distinct_person_new
    ), 
    -- Combine the list of new manager record with party_guid
    distinct_person_wGuid AS(
        SELECT 
            old_wGuid.party_guid,
            old_wGuid.person_combo_id
        FROM  distinct_person_old_wGuid old_wGuid
        UNION
        SELECT
            new_wGuid.party_guid,
            new_wGuid.person_combo_id
        FROM distinct_person_new_wGuid new_wGuid
    ), 

    -- Full manager table 
    mms_manager_full AS (
        SELECT
            manager_info.mine_no            ,
            manager_info.mine_guid          ,
            distinct_person_wGuid.party_guid    ,
            manager_info.first_name         ,
            manager_info.surname            ,
            manager_info.phone_no           ,
            manager_info.email              ,
            manager_info.effective_date     ,
            manager_info.person_combo_id    ,
            manager_info.mgr_combo_id
        FROM new_mms_manager manager_info
        INNER JOIN distinct_person_wGuid ON
            manager_info.person_combo_id=distinct_person_wGuid.person_combo_id
    ) 
    INSERT INTO ETL_MANAGER (
        mine_guid    ,
        mine_no      ,
        party_guid  ,
        first_name   ,
        surname      ,
        phone_no     ,
        email        ,
        effective_date,
        person_combo_id,
        mgr_combo_id     )
    SELECT
        manager.mine_guid           ,
        manager.mine_no             ,
        manager.party_guid         ,
        manager.first_name          ,
        manager.surname             ,
        manager.phone_no            ,
        manager.email               ,
        manager.effective_date      ,
        manager.person_combo_id     ,
        manager.mgr_combo_id
    FROM mms_manager_full manager;
    SELECT count(*) FROM ETL_MANAGER INTO new_row; 
    RAISE NOTICE '.... # of new manager records loaded into MDS: %', (new_row-old_row); 
END $$;




DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 3: Update contact details for new person'; 
    SELECT count(*) FROM person INTO old_row;
    WITH 
    --Select only new entry in ETL_Manager table
    new_manager AS(
        SELECT *
        FROM ETL_MANAGER
        WHERE NOT EXISTS (
            SELECT  1
            FROM    person
            WHERE   
                party_guid = ETL_MANAGER.party_guid
        )
    ),
    distinct_new_manager AS (
        SELECT DISTINCT ON
            (party_guid) party_guid       ,
            first_name                      ,
            surname                         ,
            phone_no                        ,
            email                           ,
            effective_date      
        FROM new_manager
    )
    INSERT INTO party(
        party_guid ,
        first_name  ,	
        party_name     ,
        phone_no	,
        phone_ext	,
        email	    ,
        effective_date  ,
        expiry_date	    ,
        create_user	    ,
        create_timestamp,
        update_user	    ,
        update_timestamp,
        party_type_code

    )
    SELECT 
        new.party_guid ,
        new.first_name  ,
        new.surname     ,
        new.phone_no    ,
        'N/A'           ,
        new.email       ,
        new.effective_date,
        '9999-12-31'::date,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()               ,
        'PER'
    FROM distinct_new_manager new;
    SELECT count(*) FROM person INTO new_row; 
    RAISE NOTICE '.... # new person records MMS: %', (new_row-old_row);
    RAISE NOTICE '.... Total person records MMS: %', (new_row);
END $$; 

DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 3 of 3: Update mine manager assignment'; 
    SELECT count(*) FROM mgr_appointment INTO old_row;
    --select 
    WITH new_manager AS
    (
        SELECT *
        FROM ETL_MANAGER
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mgr_appointment
            WHERE   
                party_guid = ETL_MANAGER.party_guid
            AND 
                mine_guid = ETL_Manager.mine_guid
        )
    )
    INSERT INTO mgr_appointment(
        mgr_appointment_guid,
        mine_guid	        ,
        party_guid	        ,
        effective_date	    ,
        expiry_date	 	    ,
        create_user	        ,	
        create_timestamp	,
        update_user         ,	
        update_timestamp
    )
    SELECT
        gen_random_uuid()   ,-- Generate a random UUID for mgr_appointment_guid
        new.mine_guid       ,
        new.party_guid     ,
        new.effective_date  ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_manager new;
    SELECT count(*) FROM mgr_appointment INTO new_row; 
    RAISE NOTICE '.... # new manager assignment: %', (new_row-old_row);
    RAISE NOTICE '.... Total mine reords with manager information: %', (new_row);
    RAISE NOTICE 'Finish updating mine manager.';
END $$; 

 








