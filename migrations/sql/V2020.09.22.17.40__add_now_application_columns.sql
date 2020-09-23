ALTER TABLE now_application ADD COLUMN term_of_application integer,
ADD COLUMN proposed_annual_maximum_tonnage integer,
ADD COLUMN adjusted_annual_maximum_tonnage integer,
ADD COLUMN annual_maximum_tonnage_unit_type_code character varying(3),
ADD FOREIGN KEY (annual_maximum_tonnage_unit_type_code) REFERENCES unit_type(unit_type_code) DEFERRABLE INITIALLY deferred;
