ALTER TABLE
    mine_incident
    ADD COLUMN verbal_notification_provided boolean,
    ADD COLUMN verbal_notification_timestamp timestamp with time zone;