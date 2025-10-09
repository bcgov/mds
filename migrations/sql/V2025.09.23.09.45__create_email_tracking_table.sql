-- Create enum types for email tracking
CREATE TYPE email_status_enum AS ENUM (
    'sent',
    'accepted',
    'cancelled',
    'completed'
    'failed',
    'pending'
);

CREATE TYPE recipient_type_enum AS ENUM (
    'primary',
    'cc',
    'bcc'
);

-- Create generic email tracking table for all entities
CREATE TABLE email_tracking (
                                email_tracking_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Generic reference to any entity this email relates to
                                reference_id uuid NOT NULL,
                                reference_table varchar(100) NOT NULL,
                                reference_email_type varchar(100),

    -- Email content and template information
                                email_template_name varchar(255),
                                email_subject varchar(500),

    -- Recipient information
                                recipient_email varchar(320) NOT NULL, -- RFC 5321 max email length
                                recipient_name varchar(255),
                                recipient_type recipient_type_enum NOT NULL DEFAULT 'primary',

    -- Email status tracking
                                email_status email_status_enum NOT NULL DEFAULT 'pending',
                                sent_timestamp timestamp with time zone,
                                delivered_timestamp timestamp with time zone,
                                failed_timestamp timestamp with time zone,

    -- Error tracking
                                error_message text,

    -- CHES specific fields
                                ches_message_id uuid, -- CHES returns a message ID for tracking
                                ches_transaction_id uuid, -- CHES transaction identifier

    -- Audit fields
                                create_user varchar(60) NOT NULL,
                                create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
                                update_user varchar(60) NOT NULL,
                                update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

-- Add comments for documentation
COMMENT ON TABLE email_tracking IS 'Generic email tracking table for all entities using CHES service';
COMMENT ON COLUMN email_tracking.reference_id IS 'UUID of the entity this email relates to (can reference any table)';
COMMENT ON COLUMN email_tracking.reference_table IS 'Name of the table that the reference_id points to';
COMMENT ON COLUMN email_tracking.reference_email_type IS 'Type of email this is (e.g. documents uploaded, submission confirmation, etc.).  Needed for non template emails to differentiate between email types';
COMMENT ON COLUMN email_tracking.email_template_name IS 'Name/identifier of the email template used';
COMMENT ON COLUMN email_tracking.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN email_tracking.email_status IS 'Current status of the email (enum: pending, accepted, sent, delivered, failed, bounced, cancelled, completed)';
COMMENT ON COLUMN email_tracking.ches_message_id IS 'CHES service message identifier for tracking';
COMMENT ON COLUMN email_tracking.ches_transaction_id IS 'CHES transaction identifier';

-- Add comments for enum types
COMMENT ON TYPE email_status_enum IS 'Email status values: sent (transmitted), accepted (by CHES), pending (queued), failed (permanent failure), cancelled (user cancelled), completed (final success state)';
COMMENT ON TYPE recipient_type_enum IS 'Recipient type: primary, cc, bcc';

-- Create indexes for performance
CREATE INDEX idx_email_tracking_reference ON email_tracking(reference_id, reference_table);
CREATE INDEX idx_email_tracking_status ON email_tracking(email_status);
CREATE INDEX idx_email_tracking_template ON email_tracking(email_template_name);
CREATE INDEX idx_email_tracking_recipient ON email_tracking(recipient_email);
CREATE INDEX idx_email_tracking_sent_timestamp ON email_tracking(sent_timestamp);
CREATE INDEX idx_email_tracking_ches_message_id ON email_tracking(ches_message_id);

-- Create composite index for common query patterns
CREATE INDEX idx_email_tracking_ref_status ON email_tracking(reference_id, reference_table, email_status);
CREATE INDEX idx_email_tracking_template_status ON email_tracking(email_template_name, email_status);
CREATE INDEX idx_email_tracking_table_status ON email_tracking(reference_table, email_status);