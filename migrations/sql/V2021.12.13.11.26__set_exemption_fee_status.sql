-- All closed permits are exempt, drafts will be updated once issued.
update permit
set exemption_fee_status_code = 'Y'
where permit.permit_status_code in ('C', 'D') and exemption_fee_status_code is null;

-- All Placer permits are exempt.
update permit set exemption_fee_status_code = 'Y' where permit_no like 'P-%' and exemption_fee_status_code is null;

-- All Quary and S&G permits are 'MIP'.
update permit set exemption_fee_status_code = 'MIP' where permit_no like 'G-%' and exemption_fee_status_code is null;
update permit set exemption_fee_status_code = 'MIP' where permit_no like 'Q-%' and exemption_fee_status_code is null;

-- All Mineral and Coal are 'MIM'. 
update permit set exemption_fee_status_code = 'MIM' where permit_no like 'C-%' and exemption_fee_status_code is null;
update permit set exemption_fee_status_code = 'MIM' where permit_no like 'M-%' and exemption_fee_status_code is null;

-- Exploration with ONLY surface, are exempt.