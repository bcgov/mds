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
