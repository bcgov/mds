ALTER TABLE permittee 
    ADD effective_date date NOT NULL DEFAULT now(),
    ADD expiry_date date NOT NULL DEFAULT '9999-12-31'::date
;
