ALTER TABLE
    activity.activity_notification
ADD
    COLUMN IF NOT EXISTS idempotency_key varchar(120) NULL;