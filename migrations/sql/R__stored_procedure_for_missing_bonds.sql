CREATE OR REPLACE FUNCTION refresh_ses_staging() RETURNS void AS $$
    BEGIN
        DECLARE
            old_row    integer;
            new_row    integer;
            update_row integer;
        BEGIN
            RAISE NOTICE 're-creating staging table:';
            -- This is the intermediary table that will be used to store valid mine status data from MMS
            TRUNCATE TABLE IF EXISTS SES_BOND_STAGING;
            CREATE TABLE IF NOT EXISTS SES_BOND_STAGING (
                sec_cid varchar,
                sec_amt numeric(12,2),
                bond_type_code varchar,
                bond_status_code varchar,
                cnt_dt TIMESTAMP,
                "comment" varchar,
                cmp_nm varchar,
                institution_city varchar,
                institution_name varchar,
                institution_province varchar,
                institution_street varchar,
                institution_postal_code varchar,
                permit_no varchar,
                project_no varchar,
                reference_number varchar
            );
        RAISE NOTICE 'populating staging table with ses records not in CORE:';

     INSERT INTO SES_BOND_STAGING
      (
        sec_cid,
        sec_amt,
        bond_type_code,
        bond_status_code,
        cnt_dt,
        "comment",
        cmp_nm,
        institution_city,
        institution_name,
        institution_province,
        institution_street,
        institution_postal_code,
        permit_no,
        project_no,
        reference_number
        )
        SELECT
            sec_cid,
            sec_amt,
            case
                when TRIM(sec_typ) = 'Asset Security Agreement' then 'ASA'
                when TRIM(sec_typ) = 'Cash' then 'CAS'
                when TRIM(sec_typ) = 'Confiscation' then 'CAS'
                when TRIM(sec_typ) = 'Letter of Credit' then 'ILC'
                when TRIM(sec_typ) = 'Qualified Env. Trust' then 'QET'
                when TRIM(sec_typ) = 'Safekeeping Agreement' then 'SAG'
                when TRIM(sec_typ) = 'Receipt and Agreement' then 'SAG'
                when TRIM(sec_typ) = 'Surety Bond' then 'SBO'
                when TRIM(sec_typ) = 'Recl. Fund' then 'STR'
                when TRIM(sec_typ) = 'Performance Bond' then 'PFB'
            end as bond_type_code,
            CASE
                WHEN "status" = 'E' THEN 'REL'
                when "status" = 'C' then 'CON'
                ELSE 'ACT'
            end as bond_status_code,
            cnt_dt,
            CONCAT(TRIM(comment1),' ', TRIM(comment2)),
            cmp_nm AS "payer_name",
            CONCAT(iaddr2,iaddr3) as institution_city,
            invloc as institution_name,
            null as institution_province,
            iaddr1 as institution_street,
            ipost_cd as institution_postal_code,
            permit_no,
            project_no,
            "descript" as reference_number
        FROM mms.secsec
        where sec_cid not in
                (select mms_sec_cid
                from bond
                where mms_sec_cid is not null);
        END;
    END;
$$LANGUAGE plpgsql;
