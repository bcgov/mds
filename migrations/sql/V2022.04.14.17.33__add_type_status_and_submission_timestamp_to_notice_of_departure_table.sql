
CREATE TYPE nod_type AS ENUM ('non_substantial', 'potentially_substantial');
CREATE TYPE nod_status AS ENUM ('pending_review', 'in_review', 'self_authorized');

ALTER TABLE notice_of_departure ADD nod_type nod_type;
ALTER TABLE notice_of_departure ADD nod_status nod_status;
ALTER TABLE notice_of_departure ADD submission_timestamp TIMESTAMP WITHOUT TIME ZONE;

UPDATE notice_of_departure SET nod_type = 'potentially_substantial' WHERE nod_type IS NULL;
UPDATE notice_of_departure SET nod_status = 'pending_review' WHERE nod_status IS NULL;
UPDATE notice_of_departure SET submission_timestamp = create_timestamp WHERE submission_timestamp IS NULL;

ALTER TABLE notice_of_departure ALTER COLUMN nod_type DROP NOT NULL;
ALTER TABLE notice_of_departure ALTER COLUMN nod_status DROP NOT NULL;
ALTER TABLE notice_of_departure ALTER COLUMN submission_timestamp DROP NOT NULL;
