ALTER TABLE now_application DROP COLUMN ready_for_review_date CASCADE;
ALTER TABLE now_application DROP COLUMN referral_closed_on_date CASCADE;
ALTER TABLE now_application DROP COLUMN public_comment_closed_on_date CASCADE;
ALTER TABLE now_application DROP COLUMN consultation_closed_on_date CASCADE;