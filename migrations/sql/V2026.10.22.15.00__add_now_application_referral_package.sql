CREATE TABLE IF NOT EXISTS now_application_referral_package (
    now_application_referral_package_id SERIAL PRIMARY KEY,
    now_application_referral_package_guid UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    now_application_id INTEGER NOT NULL REFERENCES now_application(now_application_id) ON DELETE CASCADE,
    package_order INTEGER NOT NULL,
    package_name VARCHAR(100) NOT NULL,
    deleted_ind BOOLEAN NOT NULL DEFAULT FALSE,
    create_user VARCHAR(60) NOT NULL,
    create_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_user VARCHAR(60) NOT NULL,
    update_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS now_app_ref_pkg_app_id_idx ON now_application_referral_package (now_application_id);
CREATE INDEX IF NOT EXISTS now_app_ref_pkg_guid_idx ON now_application_referral_package (now_application_referral_package_guid);

CREATE TABLE IF NOT EXISTS now_application_referral_package_document_xref (
    now_application_referral_package_document_xref_guid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    now_application_referral_package_id INTEGER NOT NULL REFERENCES now_application_referral_package(now_application_referral_package_id) ON DELETE CASCADE,
    mine_document_guid UUID NOT NULL REFERENCES mine_document(mine_document_guid),
    document_manager_guid UUID NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    category VARCHAR(100),
    deleted_ind BOOLEAN NOT NULL DEFAULT FALSE,
    create_user VARCHAR(60) NOT NULL,
    create_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    update_user VARCHAR(60) NOT NULL,
    update_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS now_app_ref_pkg_doc_pkg_id_idx ON now_application_referral_package_document_xref (now_application_referral_package_id);
CREATE INDEX IF NOT EXISTS now_app_ref_pkg_doc_mine_doc_idx ON now_application_referral_package_document_xref (mine_document_guid);
