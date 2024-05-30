INSERT INTO mine_report_notification 
    (compliance_article_id, contact_guid, is_major_mine, is_regional_mine)
    VALUES
    (
        (SELECT compliance_article_id FROM compliance_article WHERE section = '10' AND sub_section = '4' AND paragraph = '4' AND sub_paragraph = '(g)'),
        (SELECT contact_guid FROM emli_contact WHERE emli_contact_type_code = 'MMO'),
        true, 
        true
    );

UPDATE mine_report_definition
    SET is_prr_only = FALSE
    WHERE report_name = 'Annual Summary of Work and Reclamation Report';