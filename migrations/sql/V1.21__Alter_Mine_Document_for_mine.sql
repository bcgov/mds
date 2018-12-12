ALTER TABLE mine_document ADD document_name character varying(40) NOT NULL,
                          ADD document_manager_guid uuid NOT NULL,
                          DROP COLUMN doc_manager_fileid;

ALTER TABLE mine_expected_document_xref DROP COLUMN active_ind,
                                        DROP COLUMN create_user,
                                        DROP COLUMN create_timestamp,
                                        DROP COLUMN update_user, 
                                        DROP COLUMN update_timestamp;
                           