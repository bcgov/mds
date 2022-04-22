ALTER TABLE notice_of_departure ADD nod_description character varying(3000);

UPDATE notice_of_departure SET nod_description = ' ' WHERE nod_description IS NULL;
