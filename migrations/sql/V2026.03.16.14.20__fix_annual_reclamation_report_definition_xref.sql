-- Remove association from inactive report definition 679
DELETE FROM mine_report_definition_compliance_article_xref
WHERE mine_report_definition_id IN (
    SELECT mine_report_definition_id 
    FROM mine_report_definition 
    WHERE report_name = 'Annual Reclamation and Environmental Monitoring Work Report'
      AND active_ind = false
) AND compliance_article_id = (
    SELECT compliance_article_id 
    FROM compliance_article 
    WHERE section = '10' 
      AND sub_section = '3' 
      AND paragraph = '4' 
      AND sub_paragraph = '1(a)(i)' 
      AND cim_or_cpo = 'Both'
);

-- Add association for active report definition 725
INSERT INTO mine_report_definition_compliance_article_xref (
    mine_report_definition_id,
    compliance_article_id,
    create_user,
    update_user
) 
SELECT 
    m.mine_report_definition_id,
    c.compliance_article_id,
    'system_update',
    'system_update'
FROM mine_report_definition m
CROSS JOIN compliance_article c
WHERE m.mine_report_definition_guid = '3befed9e-f840-4db9-aa1d-6da3c6790880' -- The active report's GUID
  AND c.section = '10' 
  AND c.sub_section = '3' 
  AND c.paragraph = '4' 
  AND c.sub_paragraph = '1(a)(i)' 
  AND c.cim_or_cpo = 'Both'
  AND NOT EXISTS (
      SELECT 1 
      FROM mine_report_definition_compliance_article_xref xref 
      WHERE xref.mine_report_definition_id = m.mine_report_definition_id 
        AND xref.compliance_article_id = c.compliance_article_id
  );
