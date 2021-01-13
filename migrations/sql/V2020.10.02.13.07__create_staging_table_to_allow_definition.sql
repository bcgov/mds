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