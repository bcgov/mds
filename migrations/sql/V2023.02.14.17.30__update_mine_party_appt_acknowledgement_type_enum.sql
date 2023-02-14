ALTER TYPE mine_party_acknowledgement_status ADD VALUE IF NOT EXISTS 'not_required' AFTER 'not_acknowledged';

-- TODO: set a default value for mine_party_acknowledgement_status: not_required?

-- TODO: set a default value for status: active?

-- TODO: update existing data to have those defaults where null