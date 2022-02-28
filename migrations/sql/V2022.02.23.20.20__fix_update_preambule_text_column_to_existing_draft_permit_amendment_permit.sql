update permit_amendment
set is_generated_in_core = true
from (select pa.permit_amendment_guid
	  from permit_amendment pa, now_application_identity nai
	  where pa.permit_amendment_status_code = 'DFT' and
            pa.is_generated_in_core = false and
            pa.now_application_guid = nai.now_application_guid and
            nai.application_type_code = 'NOW') as now_draft_not_core
where permit_amendment.permit_amendment_guid = now_draft_not_core.permit_amendment_guid;

update permit_amendment 
set preamble_text = INITCAP (draft_permit_amendment_no_preamble_text.description)|| ' for the {{mine_name}} {{application_type}} project was filed with the Chief Permitting Officer, submitted on {{application_dated}} and last updated on {{application_last_updated_date}}. The application included a plan of the proposed work system (“Mine Plan”) and a program for the protection and reclamation of the surface of the land and watercourses (“Reclamation Program”), affected by the '|| draft_permit_amendment_no_preamble_text.description||'.'||E'\n\n'|| 'The Mines Act, the Health, Safety and Reclamation Code for Mines in British Columbia (“Code” or “HSRC”), and this Mines Act Permit contain the requirements of the Chief Permitting Officer for the execution of the Mine Plan and Reclamation Program, including the deposit of reclamation securities. Nothing in this permit limits the authority of other government agencies to set additional requirements or to act independently under their respective authorizations and legislation.'
from (select distinct pa.permit_amendment_id, case when atc.application_type_code = 'ADA' then 'application' else atc.description end as description
	  from permit_amendment pa, now_application_identity nai, application_type_code atc 
	  where pa.permit_amendment_status_code = 'DFT' and
      		pa.is_generated_in_core = true and
            pa.preamble_text is NULL and
            pa.now_application_guid = nai.now_application_guid and
      		nai.application_type_code = atc.application_type_code 
     ) as draft_permit_amendment_no_preamble_text
where permit_amendment.permit_amendment_id = draft_permit_amendment_no_preamble_text.permit_amendment_id;