-- 2. Migrate MINE MANAGER (first name, last name)
--Create the ETL_PROFILE table

DO $$
DECLARE 
    old_row   integer   ;
    new_row   integer   ;
BEGIN 
    RAISE NOTICE 'Start updating mine manager:';
    RAISE NOTICE '.. Step 1 of 3: Scan new managers in MMS';
    -- This is the intermediary table that will be used to store mine manager profile from the MMS database.
    CREATE TABLE IF NOT EXISTS ETL_MANAGER(
        mine_guid   uuid        ,
        mine_no     varchar(7)  ,
        party_guid  uuid        ,
        first_name  varchar(100),
        surname     varchar(100),
        phone_no    varchar(12) ,
        email       varchar(254),
        effective_date      date,
        person_combo_id     varchar(600),
        mgr_combo_id        varchar(600)
    );
    SELECT count(*) FROM ETL_MANAGER into old_row;

    WITH 
    --1. Major mine
    --1.1 Major mine list
    major_mine_list AS (
        SELECT
            mine_no
        FROM mms.mmsmin mine_info
        WHERE 
            min_lnk = 'Y'
    ),
    --1.2 Major mine with valid manager 
    major_manager_list AS (
        SELECT
            mine_no,
            min_man AS person_combo_id,
            mine_no||min_man AS mgr_combo_id
        FROM mms.mmsmin mine_info
        WHERE 
            mine_no IN (
                SELECT  mine_no
                FROM    major_mine_list
            )
            AND
            min_man !~ '^ *$' 
            AND 
            min_man IS NOT NULL
            AND
            min_man !~ '[0-9!@#$&()\\-`+/\:]'
    ),
    --1.3 Select new manager record
    major_new_manager AS (
        SELECT *
        FROM major_manager_list
        WHERE mgr_combo_id NOT IN (
            SELECT  mgr_combo_id
            FROM    ETL_Manager
        )
    ),
    --1.4 Check if manager is a new person and format new person (name, party_id)
    major_new_person_info AS (
        SELECT DISTINCT ON (person_combo_id)
            person_combo_id                 ,
            gen_random_uuid() AS party_guid , 
            CASE 
                WHEN person_combo_id ~ ','
                THEN split_part(person_combo_id,', ',1 )
                ELSE split_part(person_combo_id,' ',1 )
            END AS first_name,
            CASE
                WHEN person_combo_id ~ ','
                THEN COALESCE(NULLIF(regexp_replace
                    (trim(leading from person_combo_id, split_part(person_combo_id,',', 1 )||', '),
                    ' ', '', 'b'),''),'Unknown')
                ELSE COALESCE(NULLIF(regexp_replace
                    (trim(leading from person_combo_id, split_part(person_combo_id,' ',1 )||' '),
                    ' ', '', 'b'),''),'Unknown')
            END AS surname
        FROM major_new_manager 
        WHERE person_combo_id NOT IN (
            SELECT  person_combo_id
            FROM    ETL_Manager
        )
    ),
    --1.5 Complete list of person info for new manager record
    major_person_info AS (
        SELECT * FROM major_new_person_info  
        UNION
        SELECT DISTINCT ON (person_combo_id)
            person_combo_id ,
            party_guid      ,
            first_name      ,
            surname         
        FROM ETL_MANAGER  
        WHERE  person_combo_id IN (
            SELECT  DISTINCT person_combo_id
            FROM    major_new_manager
        )
    ),
    major_new_manager_info AS (
        SELECT
            manager.mine_no         ,
            manager.person_combo_id ,
            manager.mgr_combo_id    ,
            person.party_guid       ,
            person.first_name       ,
            person.surname          ,
            --no contact info for major mine as it's not from NoW
            'Unknown'::char AS phone_no        ,
            'Unknown'::char AS email           ,
            now() AS effective_date   
        FROM major_new_manager manager
        INNER JOIN major_person_info person ON
            person.person_combo_id=manager.person_combo_id
    ),
    --2 Regional Mine
    --2.1 Regional mine with valid manager
    regional_now_manager  AS(
        SELECT
            SUBSTRING(cid from 1 for 7) AS mine_no  ,
            SUBSTRING(cid from 8 for 6) AS upd_no   , 
            cid_ccn                     AS contact_cid
        FROM mms.mmsccc now_contact
        WHERE
            SUBSTRING(type_ind from 3 for 1) = 'Y'
            AND 
            --not a major mine
            SUBSTRING(cid from 1 for 7) NOT IN (
                SELECT  mine_no
                FROM    major_mine_list
            )
    ),
    --2.2 Latest NoW with manager attached
    latest_regional_now AS(
        SELECT
            mine_no                 ,
            Max(upd_no)     last_upd
        FROM regional_now_manager
        GROUP BY
            mine_no
    ),
    --2.3 Latest manager if more than 1 is attached 
    latest_regional_manager AS (
        SELECT 
            mine_no         ,
            Max(contact_cid) AS contact_cid
        FROM regional_now_manager
        WHERE mine_no||upd_no IN (
            SELECT mine_no||last_upd
            FROM latest_regional_now
        )
        GROUP BY mine_no
    ),
    --2.4 Select new manager record
    regional_new_manager AS (
        SELECT 
            mine_no ,
            contact_cid AS person_combo_id,
            mine_no||contact_cid AS mgr_combo_id
        FROM latest_regional_manager
        where mine_no||contact_cid NOT IN (
            SELECT  mgr_combo_id
            FROM    ETL_MANAGER
        )
    ),
    --2.5 Check if manager is a new person 
    regional_new_person AS (
        SELECT DISTINCT ON (person_combo_id)
            person_combo_id 
        FROM regional_new_manager
        WHERE person_combo_id NOT IN (
            SELECT  person_combo_id
            FROM    ETL_Manager
        )
    ),
    --2.6 Extract contact info and formatting
    regional_new_person_info AS(
        SELECT 
            cid AS person_combo_id  ,
            COALESCE(NULLIF(regexp_replace(contact_info.name,' ', '', 'g'),''),'Unknown') first_name,
            COALESCE(NULLIF(regexp_replace(contact_info.l_name,' ', '', 'g'),''),'Unknown') surname ,     
            NULLIF(regexp_replace(phone, '\D', '','g'),'')::numeric phone_no                        , --Extract numbers only from phone_no field
            COALESCE(NULLIF(regexp_replace(contact_info.email,' ', '', 'g'),''),'Unknown') email    ,     
            COALESCE(contact_info.add_dt,now()) effective_date
        FROM mms.mmsccn contact_info
        WHERE cid IN (
            SELECT  person_combo_id
            FROM    regional_new_person
        )
    ),
    --Format phone number field to match MDS party table schema
    regional_new_person_info_good_phone AS(
        SELECT
            gen_random_uuid() AS party_guid   ,
            person_combo_id ,
            first_name      ,
            surname         ,
            CASE 
                WHEN phone_no>=10^10 AND phone_no<2*10^10 THEN (phone_no-10^10 )::varchar--Remove country code for phone_no
                WHEN phone_no>10^9 AND phone_no<10^10 THEN (phone_no)::varchar
                ELSE 'Unknown'
            END AS phone_no ,
            email           ,
            effective_date  
        FROM regional_new_person_info 
    ),
    --2.7 Complete list of person info for new manager record
    regional_person_info AS (
        SELECT * FROM regional_new_person_info_good_phone
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
            FROM    regional_new_manager
        )
    ),
    --2.8 Complete list of new regional mine manager
    regional_new_manager_info AS (
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
        FROM regional_new_manager manager 
        INNER JOIN regional_person_info person   ON
            person.person_combo_id=manager.person_combo_id
    ),
    --3.Update MDS ETL with complete list of new mine manager
    new_manager_info AS (
        SELECT * FROM major_new_manager_info
        UNION
        SELECT * FROM regional_new_manager_info
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
    INNER JOIN mine_detail mds ON 
        mds.mine_no=mms.mine_no; 
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
        phone_no	    ,
        phone_ext	    ,
        email	        ,
        effective_date  ,
        expiry_date	    ,
        create_user	    ,
        create_timestamp,
        update_user	    ,
        update_timestamp,
        party_type_code
    )
    SELECT 
        party_guid  ,
        first_name  ,
        surname     ,
        phone_no    ,
        'N/A'       ,
        email       ,
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
    SELECT count(*) FROM mgr_appointment INTO old_row;
    --select only new record
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
        new.party_guid      ,
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

 








