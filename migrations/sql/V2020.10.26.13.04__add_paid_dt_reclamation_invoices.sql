
ALTER TABLE reclamation_invoice ADD COLUMN paid_date TIMESTAMP;


ALTER TABLE reclamation_invoice ADD COLUMN mms_inv_cid varchar UNIQUE;