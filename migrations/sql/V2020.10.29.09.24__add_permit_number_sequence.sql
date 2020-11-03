
ALTER TABLE permit ADD COLUMN permit_no_sequence integer;
CREATE SEQUENCE permit_number_seq;
ALTER SEQUENCE permit_number_seq RESTART WITH 100000000;