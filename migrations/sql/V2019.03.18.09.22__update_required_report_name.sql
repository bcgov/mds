UPDATE mds_required_document SET req_document_name = 'Summary of TSF and Dam Safety Recommendations' WHERE req_document_name = 'Annual TSF and Dam safety recommendations';
UPDATE mds_required_document SET req_document_name = 'ITRB Activities Report' WHERE req_document_name = 'ITRB Activities (Annual)';
UPDATE mds_required_document SET req_document_name = 'Register of Tailings Storage Facilities and Dams' WHERE req_document_name = 'Register of tailings storage facilities and dams';
UPDATE mds_required_document SET req_document_name = 'Dam Safety Inspection (DSI) Report' WHERE req_document_name = 'Annual DSI';
UPDATE mds_required_document SET req_document_name = 'Dam Safety Review (DSR) Report' WHERE req_document_name = '5 year DSR';
UPDATE mds_required_document SET req_document_name = '“As-built” Reports' WHERE req_document_name = 'As Built Reports';

UPDATE mine_expected_document SET exp_document_name = 'Summary of TSF and Dam Safety Recommendations' WHERE exp_document_name = 'Annual TSF and Dam safety recommendations';
UPDATE mine_expected_document SET exp_document_name = 'ITRB Activities Report' WHERE exp_document_name = 'ITRB Activities (Annual)';
UPDATE mine_expected_document SET exp_document_name = 'Register of Tailings Storage Facilities and Dams' WHERE exp_document_name = 'Register of tailings storage facilities and dams';
UPDATE mine_expected_document SET exp_document_name = 'Dam Safety Inspection (DSI) Report' WHERE exp_document_name = 'Annual DSI';
UPDATE mine_expected_document SET exp_document_name = 'Dam Safety Review (DSR) Report' WHERE exp_document_name = '5 year DSR';
UPDATE mine_expected_document SET exp_document_name = '“As-built” Reports' WHERE exp_document_name = 'As Built Reports';