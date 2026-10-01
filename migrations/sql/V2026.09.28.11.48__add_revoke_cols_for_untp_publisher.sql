ALTER TABLE permit_amendment_orgbook_publish_status
ADD COLUMN IF NOT EXISTS revoked_ind BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS revoked_reason TEXT;