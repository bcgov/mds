-- 2. Migrate MINE MANAGER (first name, last name)
<<<<<<< HEAD
--Create the ETL_PROFILE table

DO $$
DECLARE 
    old_row   integer;
    new_row   integer;
BEGIN 
    RAISE NOTICE 'Start updating mine manager:';
    RAISE NOTICE '.. Step 1 of 2: Scan if any new managers are created in MMS';
    SELECT count(*) FROM ETL_MANAGER into old_row;
    -- This is the intermediary table that will be used to store mine manager profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_MANAGER(
        mine_guid   uuid        ,
        mine_no     varchar(7)  ,
        person_guid uuid        ,
        first_name  varchar(100),
        surname     varchar(100),
        phone_no    varchar(12),
        email       varchar(254),
        effective_date  date NOT NULL DEFAULT now()
    );
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
=======

--List of NoW (Notice Of Work) whose attached contact is a Mine Manager;
DROP TABLE IF EXISTS now_wContact;
CREATE TEMP TABLE now_wContact AS
(
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
);

--Sublist of 'now_wContact' selecting only the latest record for each mine based on 'upd_no'
DROP TABLE IF EXISTS latest_now_wContact;
CREATE TEMP TABLE latest_now_wContact AS(
    --Select the most recent NoW for each mine in now_wContact; 
    --This list may contain more than 1 cid_ccn (contact ref id) if more than 1 manger are listed in a single NoW
    WITH latest_now AS(
>>>>>>> 39f2d731dcb198e53063ce6147a06694d616b0aa
        SELECT
            now_wContact.mine_no,
            Max(upd_no) last_upd
        FROM now_wContact
        GROUP BY
            now_wContact.mine_no
<<<<<<< HEAD
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
=======
    )
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
);
 

--Retrieve mine manager ref id
DROP TABLE IF EXISTS manager_ref_list;
CREATE TEMP TABLE manager_ref_list AS(
    --Sublist of `latest_now_wContact` selecting only one manager contact based on `cid_ccn`
    WITH manager_selection AS(
>>>>>>> 39f2d731dcb198e53063ce6147a06694d616b0aa
        SELECT
            cid,
            max(cid_ccn) contact_ref
        FROM latest_now_wContact
        GROUP BY cid
<<<<<<< HEAD
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
            COALESCE(contact_info.name,'Unknown') first_name,
            COALESCE(contact_info.l_name,'Unknown') surname ,
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
    -- Upsert data into ETL_MANAGER from MMS
    -- If new mine with manager info has been added since the last ETL, only insert the new ones.
    -- Generate a random UUID for person_guid
    mms_manager  AS(
        SELECT
            mine_detail.mine_no     ,
            mine_detail.mine_guid   ,
            manager_info.first_name ,
            manager_info.surname    ,
            manager_info.phone_no   ,
            manager_info.email      ,
            manager_info.effective_date
        FROM mine_detail 
        INNER JOIN manager_info ON
            mine_detail.mine_no=manager_info.mine_no
    ),
    new_mms_manager AS(
        SELECT *
        FROM mms_manager
        WHERE NOT EXISTS (
            SELECT 1
            FROM ETL_MANAGER
            WHERE mine_no = mms_manager.mine_no
        )
    )
    INSERT INTO ETL_MANAGER (
        mine_guid    ,
        mine_no      ,
        person_guid  ,
        first_name   ,
        surname      ,
        phone_no     ,
        email        ,
        effective_date )
    SELECT
        manager.mine_guid           ,
        manager.mine_no             ,
        gen_random_uuid()           ,
        manager.first_name          ,
        manager.surname             ,
        manager.phone_no            ,
        manager.email               ,
        manager.effective_date 
    FROM new_mms_manager manager;
    SELECT count(*) FROM ETL_MANAGER INTO new_row; 
    RAISE NOTICE '.... # of new records loaded into MDS: %', (new_row-old_row); 
END $$;




DO $$
DECLARE
    new_row integer;
BEGIN
    RAISE NOTICE '.. Step 2 of 2: Update manager details'; 
    WITH new_manager AS
    (
        SELECT *
        FROM ETL_MANAGER
        WHERE NOT EXISTS (
            SELECT  1
            FROM    person
            WHERE   first_name||surname||phone_no = (ETL_MANAGER.first_name)||(ETL_MANAGER.surname)||(ETL_MANAGER.phone_no)
        )
    )
    INSERT INTO person(
        person_guid ,
        first_name  ,	
        surname     ,
        phone_no	,
        phone_ext	,
        email	    ,
        effective_date  ,
        expiry_date	    ,
        create_user	    ,
        create_timestamp,
        update_user	    ,
        update_timestamp
    )
    SELECT 
        new.person_guid ,
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
        now()
    FROM new_manager new;
    SELECT count(*) FROM person INTO new_row; 
    RAISE NOTICE '.... Total manager records MMS: %', (new_row);
END $$; 

DO $$
DECLARE
    old_row integer;
    new_row integer;
BEGIN
    SELECT count(*) FROM mgr_appointment INTO old_row;
    WITH new_manager AS
    (
        SELECT *
        FROM ETL_MANAGER
        WHERE NOT EXISTS (
            SELECT  1
            FROM    mgr_appointment
            WHERE   person_guid = ETL_MANAGER.person_guid
        )
    )
    INSERT INTO mgr_appointment(
        mgr_appointment_guid,
        mine_guid	        ,
        person_guid	        ,
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
        new.person_guid     ,
        new.effective_date  ,
        '9999-12-31'::date  ,
        'mms_migration'     ,
        now()               ,
        'mms_migration'     ,
        now()
    FROM new_manager new;
    SELECT count(*) FROM mgr_appointment INTO new_row; 
    RAISE NOTICE '.... Total new manager assignment: %', (new_row-old_row);
    RAISE NOTICE '.... Total mine reords with manager information: %', (new_row);
    RAISE NOTICE 'Finish updating mine manager.';
END $$; 

 
=======
    )
    SELECT
        latest_now.mine_no,
        manager_selection.contact_ref
    FROM manager_selection
    INNER JOIN latest_now_wContact latest_now ON
        manager_selection.contact_ref=latest_now.cid_ccn
        AND
        manager_selection.cid=latest_now.cid
);

--format data from MMS and handle NULL value
DROP TABLE IF EXISTS manager_info;
CREATE TEMP TABLE manager_info AS (
    SELECT
        manager_ref_list.mine_no,
        COALESCE(contact_info.name,'Unknown') first_name,
        COALESCE(contact_info.l_name,'Unknown') surname ,
        COALESCE(
            SUBSTRING(contact_info.phone from 2 for 3)||
            SUBSTRING(contact_info.phone from 7 for 3)||
            SUBSTRING(contact_info.phone from 11 for 4),
            'Unknown'
        ) phone_no,   
        COALESCE(contact_info.email,'Unknown')   email    ,
        COALESCE(contact_info.add_dt,now()) effective_date
    FROM manager_ref_list
    INNER JOIN mms.mmsccn contact_info ON
        contact_info.cid = manager_ref_list.contact_ref
);



--Create the ETL_PROFILE table
/*
This is the intermediary table that will be used to
store mine manager profile from the MMS database.
*/
CREATE TABLE IF NOT EXISTS ETL_MANAGER(
    mine_guid   uuid        ,
    mine_no     varchar(7)  ,
    person_guid uuid        ,
    first_name  varchar(100),
    surname     varchar(100),
    phone_no    varchar(10),
    email       varchar(254),
    effective_date  date NOT NULL DEFAULT now()
);

-- Upsert data into ETL_MANAGER from MMS
-- If new mine with manager info has been added since the last ETL, only insert the new ones.
-- Generate a random UUID for person_guid
WITH mine_to_manager AS(
    SELECT
        mine_detail.mine_no,
        mine_detail.mine_guid,
        manager_info.first_name,
        manager_info.surname ,
        manager_info.phone_no ,
        manager_info.email          ,
        manager_info.effective_date
    FROM mine_detail 
    INNER JOIN manager_info ON
        mine_detail.mine_no=manager_info.mine_no
)
INSERT INTO ETL_MANAGER (
    mine_guid    ,
    mine_no      ,
    person_guid  ,
    first_name   ,
    surname      ,
    phone_no     ,
    email        ,
    effective_date
)
SELECT
    manager.mine_guid           ,
    manager.mine_no             ,
    gen_random_uuid()           ,
    manager.first_name          ,
    manager.surname             ,
    CASE 
        WHEN manager.phone_no='' THEN 'Unknown'
        WHEN manager.phone_no='   ' THEN 'Unknown'
        ELSE manager.phone_no
    END                         ,
    CASE manager.email
        WHEN '' THEN 'Unknown'
        WHEN '   ' THEN 'Unknown'
        ELSE manager.email
    END                         ,
    manager.effective_date 
FROM mine_to_manager manager
WHERE NOT EXISTS (
    SELECT 1
    FROM ETL_MANAGER
    WHERE mine_no = manager.mine_no
);

--Temp table to store only records in ETL_MANAGER that does not exist in mine_person
DROP TABLE IF EXISTS new_manager;
CREATE TEMP TABLE new_manager AS
(
    SELECT *
    FROM ETL_MANAGER
    WHERE NOT EXISTS (
        SELECT  1
        FROM    person
        WHERE   person_guid = ETL_MANAGER.person_guid
    )
);

-- Upsert data from new_manager into person table
INSERT INTO person(
    person_guid ,
    first_name  ,	
    surname     ,
    phone_no	,
    phone_ext	,
    email	    ,
    effective_date  ,
    expiry_date	    ,
    create_user	    ,
    create_timestamp,
    update_user	    ,
    update_timestamp
)
SELECT 
    new.person_guid ,
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
    now()
FROM new_manager new;


-- Upsert data from new_manager into mgr_appointment table
-- Generate a random UUID for mgr_appointment_guid
INSERT INTO mgr_appointment(
    mgr_appointment_guid,
    mine_guid	        ,
    person_guid	        ,
    effective_date	    ,
    expiry_date	 	    ,
    create_user	        ,	
    create_timestamp	,
    update_user         ,	
    update_timestamp
)
SELECT
    gen_random_uuid()   ,
    new.mine_guid       ,
    new.person_guid     ,
    new.effective_date  ,
    '9999-12-31'::date  ,
    'mms_migration'     ,
    now()               ,
    'mms_migration'     ,
    now()
FROM new_manager new;
>>>>>>> 39f2d731dcb198e53063ce6147a06694d616b0aa








