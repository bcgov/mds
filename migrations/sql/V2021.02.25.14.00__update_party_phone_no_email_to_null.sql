UPDATE party 
SET 
phone_no = (CASE WHEN phone_no = 'Unknown' THEN NULL ELSE phone_no END),
email = (CASE WHEN email = 'Unknown' THEN NULL ELSE email END)
WHERE phone_no = 'Unknown' OR email = 'Unknown'