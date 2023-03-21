CREATE SEQUENCE IF NOT EXISTS explosives_permit_number_sequence;

CREATE SEQUENCE IF NOT EXISTS explosives_permit_application_number_sequence;

-- find the highest value matching BC-100XX and start the sequence at the next one, or 10000 if no results
SELECT setval('explosives_permit_number_sequence', 
    COALESCE((
        SELECT SUBSTRING(permit_number FROM 4)::int AS perm_num FROM explosives_permit WHERE permit_number LIKE '%BC-100%' ORDER BY perm_num DESC LIMIT 1
    ), 9999)
);

SELECT setval('explosives_permit_application_number_sequence', 
    COALESCE((
        SELECT SUBSTRING(application_number FROM 0 FOR 6)::int AS app_num FROM explosives_permit WHERE application_number ~ '[0-9]{5}-[0-9]{4}-[0-9]{2}' ORDER BY app_num DESC LIMIT 1
    ), 9999)
);
