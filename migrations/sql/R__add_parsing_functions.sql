CREATE OR REPLACE FUNCTION permitee_party_type(party_name varchar) RETURNS varchar AS $$
DECLARE
company_keyword_special varchar := '[-!0-9@#$&()`+/\"]|Mining|Mineral|Resources|National|Regional|Energy|Products| and | of |Pacific|Metal|Canada|Canadian|Engineering|Mountain|Lake';
--case sensitive keyword
company_keyword_cs  varchar :='Corp|Inc|Expl|Mine|INC|South|North|West';
--case insensitive keyword
company_keyword_ci  varchar :='ltd|limited|co.|holdings|Contracting|llp|Consultants|Enterprise|service|city|ulc|Association|Partnership|Trucking|Property|Division|Industries|Developments';
BEGIN
    RETURN(
        SELECT
            CASE
                WHEN
                    party_name ~* company_keyword_special OR
                    party_name ~ company_keyword_cs OR
                    party_name ~* company_keyword_ci
                THEN 'ORG'
                ELSE 'PER'
            END
        );
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION format_permittee_party_name(permitee_name varchar) RETURNS varchar AS $$
BEGIN
    RETURN(
        SELECT CASE
            WHEN permitee_name ~ ',' THEN NULLIF(trim(leading from permitee_name, split_part(permitee_name,',', 1 )||', '),'')
            WHEN permitee_name ~ ' ' THEN NULLIF(trim(leading from permitee_name, split_part(permitee_name,' ',1 )||' '),'')
            ELSE permitee_name
    END);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION format_permittee_first_name(first_name varchar) RETURNS varchar AS $$
BEGIN
    RETURN(
        SELECT CASE
            WHEN first_name ~ ','
            THEN split_part(first_name,', ',1 )
            WHEN first_name ~ ' '
            THEN split_part(first_name,' ', 1 )
            ELSE NULL
    END);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION convert_to_integer(v_input text) RETURNS INTEGER AS $$
DECLARE v_int_value INTEGER DEFAULT NULL;
BEGIN
    BEGIN
        v_int_value := v_input::INTEGER;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Invalid integer value: "%".  Returning NULL.', v_input;
        RETURN NULL;
    END;
RETURN v_int_value;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION mms_permit_no_to_ses_convert(mms_permit_no varchar) RETURNS varchar AS $$
BEGIN
    DECLARE
        result varchar;
        parts varchar[3];
    BEGIN

    select string_to_array(mms_permit_no,'-') into parts;

    select
    CASE
        WHEN parts[3] is null THEN
        --no second -.
        UPPER(CONCAT(
            RPAD(TRIM(parts[1]),2, ' '),
            '-   -',
            LPAD(TRIM(LTRIM(parts[2],'0')),3,' ')
        ))
        WHEN mms_permit_no ~ 'GEN' THEN
        -- GEN
        UPPER(CONCAT(
            RPAD(TRIM(parts[1]),2,'-'),
            '-',
            LPAD(TRIM(parts[2]),3,' '),
            '-',
            CASE
                WHEN parts[3]::int = 0 THEN
                '   '
                ELSE
                LPAD(TRIM(LTRIM(parts[3],'0')),3,' ')
            END
        ))
        ELSE
        -- normal case
        UPPER(CONCAT(
            RPAD(TRIM(parts[1]),2,' '),
            '-',
            CASE
                WHEN parts[2]::int = 0 THEN
                '   '
                ELSE
                LPAD(TRIM(LTRIM(parts[2],'0')),3,' ')
            END,
            '-',
            CASE
                WHEN parts[3]::int = 0 THEN
                '   '
                ELSE
                LPAD(TRIM(LTRIM(parts[3],'0')),3,' ')
            END
        ))
    END
    into result;

    RETURN result;
END;
END;
$$ LANGUAGE plpgsql;
