ALTER TABLE water_supply ALTER COLUMN permit_application_id SET NOT NULL;

ALTER TABLE placer_operation ALTER COLUMN is_underground SET NOT NULL DEFAULT 'false';
ALTER TABLE placer_operation ALTER COLUMN is_hand_operation SET NOT NULL DEFAULT 'false';