ALTER TABLE mine_status_xref
ADD COLUMN description character varying(1024);

UPDATE mine_status_xref SET description = 'The mine site is shut down, the permit obligations have been fulfilled. Bond has been returned if permittee completed reclamation work.' 
WHERE mine_operation_status_code = 'ABN' and mine_operation_status_reason_code = null and mine_operation_status_sub_reason_code = null;

UPDATE mine_status_xref SET description = 'The mine is temporarily closed. It is expected that it will eventually re-open. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'CM' and mine_operation_status_sub_reason_code = null;

UPDATE mine_status_xref SET description = 'The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'REC' and mine_operation_status_sub_reason_code = 'LTM';
UPDATE mine_status_xref SET description = 'The mine is closed and not expected to re-open. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Permit and HSRC obligations are still in place. Site is subject to inspection and still has reporting to file with the Ministry.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'REC' and mine_operation_status_sub_reason_code = 'LWT';
UPDATE mine_status_xref SET description = 'Reclamation work is complete, no additional care required. Ministry needs to return bond and close permit for mine to be Abandoned.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'REC' and mine_operation_status_sub_reason_code = 'PRP';

UPDATE mine_status_xref SET description = 'The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site. Contractors are performing the work.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'ORP' and mine_operation_status_sub_reason_code = 'LTM';
UPDATE mine_status_xref SET description = 'The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work is under way. There are long-term care and maintenance activities on site in addition to water treatment. Contractors are performing the work.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'ORP' and mine_operation_status_sub_reason_code = 'LWT';
UPDATE mine_status_xref SET description = 'The permittee is not able or available to meet permit obligations. The Ministry has taken over responsibility for the mine. Reclamation work has not started. A contractor has not been retained to perform the work.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'ORP' and mine_operation_status_sub_reason_code = 'RNS';
UPDATE mine_status_xref SET description = 'The permittee is not able or available to meet permit obligations. The Ministry will take over responsibility for the mine. The site needs to be visited and assessed to determine status and work required.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'ORP' and mine_operation_status_sub_reason_code = 'SVR';

UPDATE mine_status_xref SET description = 'Ministry has not determined if the permittee is able or available to meet permit obligations. A visit to the site is required.' 
WHERE mine_operation_status_code = 'CLD' and mine_operation_status_reason_code = 'UN' and mine_operation_status_sub_reason_code = null;

UPDATE mine_status_xref SET description = 'No mine related work has started at this site (including exploration). The mine record may have been created as placeholder for an exploration permit. Sites with closed exploration permits that are constructing production facilities also fit into this category.' 
WHERE mine_operation_status_code = 'NS' and mine_operation_status_reason_code = null and mine_operation_status_sub_reason_code = null;

UPDATE mine_status_xref SET description = 'This mine operates year-round (can be conducting exploration and/or production activities).' 
WHERE mine_operation_status_code = 'OP' and mine_operation_status_reason_code = 'YR' and mine_operation_status_sub_reason_code = null;
UPDATE mine_status_xref SET description = 'This mine operates seasonally. Dates shown are from the most recently approved NoW application. Confirm operating dates with operator or permittee before visiting.' 
WHERE mine_operation_status_code = 'OP' and mine_operation_status_reason_code = 'SEA' and mine_operation_status_sub_reason_code = null;
