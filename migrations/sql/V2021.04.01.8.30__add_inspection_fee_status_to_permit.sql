ALTER TABLE permit ADD COLUMN exemption_fee_status_code varchar REFERENCES exemption_fee_status(exemption_fee_status_code);
ALTER TABLE permit ADD COLUMN exemption_fee_status_note varchar;