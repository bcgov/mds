DELETE FROM
    mine_report_category_xref
WHERE
    mine_report_definition_id = 48
    AND mine_report_category = 'TSF';

INSERT INTO
    mine_report_category_xref (mine_report_definition_id, mine_report_category)
values
    (
        (
            SELECT
                x.mine_report_definition_id
            from
                mine_report_definition x
            where
                report_name = 'TSF and Dam Registry Updates'
            LIMIT
                1
        ), 'TSF'
    ) ON CONFLICT DO NOTHING;