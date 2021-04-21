CREATE SEQUENCE mine_mine_number_seq;
ALTER SEQUENCE mine_mine_number_seq RESTART WITH 2000000;

ALTER TABLE mine
ALTER COLUMN mine_no_sequence SET DEFAULT nextval('mine_mine_number_seq');

CREATE FUNCTION new_mine_number_function()
RETURNS trigger AS '
BEGIN
  IF NEW.mine_no IS NULL THEN
    NEW.mine_no := NEW.mine_no_sequence;
  END IF;
  RETURN NEW;
END' LANGUAGE 'plpgsql';


CREATE TRIGGER new_mine_mine_number BEFORE INSERT ON mine
    FOR EACH ROW EXECUTE PROCEDURE new_mine_number_function();