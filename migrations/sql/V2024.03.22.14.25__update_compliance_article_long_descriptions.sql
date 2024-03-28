ALTER TABLE mine_report_definition
ADD COLUMN is_prr_only BOOLEAN DEFAULT FALSE;

UPDATE mine_report_definition
SET is_prr_only = FALSE
WHERE is_prr_only IS NULL;

ALTER TABLE mine_report_definition
ALTER COLUMN is_prr_only SET NOT NULL;

DO $$
    DECLARE
        annual_placer_report_id INTEGER;
        annual_work_and_reclamation_report_id INTEGER;
        multi_year_report_id INTEGER;

    BEGIN

        SELECT mine_report_definition_id INTO annual_placer_report_id
        FROM mine_report_definition
        WHERE report_name = 'Annual Summary of Placer Activities';

        SELECT mine_report_definition_id INTO annual_work_and_reclamation_report_id
        FROM mine_report_definition
        WHERE report_name = 'Annual Summary of Work and Reclamation Report';

        SELECT mine_report_definition_id INTO multi_year_report_id
        FROM mine_report_definition
        WHERE report_name = 'Multi-Year Area Based Permit Updates';

        UPDATE mine_report_definition
        SET is_prr_only = TRUE, is_common = FALSE
        WHERE mine_report_definition_id = annual_placer_report_id
           OR mine_report_definition_id = annual_work_and_reclamation_report_id
           OR mine_report_definition_id = multi_year_report_id;

    END
$$;

UPDATE compliance_article
SET
    sub_paragraph = '(g)',
    long_description = 'This report is an annually completed PDF fillable form called "Annual Summary of Work and Reclamation" and required maps for Sand and Gravel/Quarry Operations where required by permit condition.'
WHERE
    section = '10'
    AND sub_section = '4'
    AND paragraph = '4'
    AND sub_paragraph = 'g';

DO
$$
    DECLARE
        report_id INTEGER;
        correct_compliance_article_id INTEGER;
        incorrect_compliance_article_id INTEGER;
    BEGIN

        SELECT mine_report_definition_id INTO report_id
        FROM mine_report_definition
        WHERE report_name = 'Annual Summary of Work and Reclamation Report';

        SELECT compliance_article_id INTO incorrect_compliance_article_id
        FROM mine_report_definition_compliance_article_xref
        WHERE mine_report_definition_id = report_id;

        SELECT compliance_article_id INTO correct_compliance_article_id
        FROM compliance_article
        WHERE section = '10'
          AND sub_section = '4'
          AND paragraph = '4'
          AND sub_paragraph = '(g)';

        UPDATE mine_report_definition_compliance_article_xref
            SET compliance_article_id = correct_compliance_article_id
        WHERE mine_report_definition_id = report_id
          AND compliance_article_id = incorrect_compliance_article_id;
    END
$$;