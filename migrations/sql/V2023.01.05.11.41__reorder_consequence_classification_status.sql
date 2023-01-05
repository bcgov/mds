UPDATE consequence_classification_status 
    SET display_order = 10
    WHERE consequence_classification_status_code = 'LOW';

UPDATE consequence_classification_status 
    SET display_order = 20
    WHERE consequence_classification_status_code = 'SIG';

UPDATE consequence_classification_status 
    SET display_order = 30
    WHERE consequence_classification_status_code = 'HIG';

UPDATE consequence_classification_status 
    SET display_order = 40
    WHERE consequence_classification_status_code = 'VHIG';

UPDATE consequence_classification_status 
    SET display_order = 50
    WHERE consequence_classification_status_code = 'EXT';

UPDATE consequence_classification_status 
    SET display_order = 60
    WHERE consequence_classification_status_code = 'NRT';

UPDATE consequence_classification_status 
    SET display_order = 70
    WHERE consequence_classification_status_code = 'NOD';

-- if we end up deleting the entry...
UPDATE mine_tailings_storage_facility 
    SET consequence_classification_status_code = 'NRT' 
    WHERE consequence_classification_status_code = 'NOD';

DELETE FROM consequence_classification_status 
    WHERE consequence_classification_status_code = 'NOD';
