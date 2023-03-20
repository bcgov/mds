CREATE SEQUENCE IF NOT EXISTS explosives_permit_number_sequence
OWNED BY explosives_permit.permit_number;

-- find the highest value matching BC-100XX and start the sequence at the next one, or 10000 if no results
SELECT setval('explosives_permit_number_sequence', 
    COALESCE((
        SELECT SUBSTRING(permit_number FROM 4)::int FROM explosives_permit WHERE permit_number LIKE '%BC-100%' ORDER BY SUBSTRING(permit_number FROM 4)::int DESC LIMIT 1
        ), 9999)
);