CREATE TYPE contact_method AS ENUM
    (
    'PHN',
    'EML',
    'MRP',
    'MRE'
    );

ALTER TABLE IF EXISTS mine_incident
ADD COLUMN IF NOT EXISTS johsc_worker_rep_contact_method contact_method,
ADD COLUMN IF NOT EXISTS johsc_worker_rep_contact_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS johsc_management_rep_contact_method contact_method,
ADD COLUMN IF NOT EXISTS johsc_management_rep_contact_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reported_to_inspector_contacted BOOLEAN,
ADD COLUMN IF NOT EXISTS reported_to_inspector_contact_method contact_method;
