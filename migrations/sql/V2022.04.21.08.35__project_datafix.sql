-- Copy data from project_summary to project table(create a project for every project summary)
INSERT INTO project (mine_guid, project_title, project_lead_party_guid, proponent_project_id, create_user,update_user)
  SELECT ps.mine_guid, ps.project_summary_title, ps.project_summary_lead_party_guid, ps.proponent_project_id, 'system-mds','system-mds'
  FROM project_summary ps
  WHERE ps.mine_guid not in (select mine_guid
								   from project);

-- Update project_summary to include FK to newly created projects
UPDATE project_summary ps SET project_guid = (SELECT project_guid FROM project WHERE mine_guid = ps.mine_guid LIMIT 1);
								  
-- Copy data from project_summary_contact to project_contact by project_guid (copied in the previous query)								   
INSERT INTO project_contact(project_guid, name, job_title, company_name, email, phone_number, phone_extension, is_primary, deleted_ind, create_user, update_user)
  SELECT pr.project_guid, psc.name, psc.job_title, psc.company_name, psc.email, psc.phone_number, psc.phone_extension, psc.is_primary, psc.deleted_ind, psc.create_user, psc.update_user
  FROM project_summary_contact psc, project pr, project_summary ps
  WHERE psc.project_summary_guid = ps.project_summary_guid and pr.project_guid = ps.project_guid;
