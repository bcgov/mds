INSERT INTO
    mine_report_submission_status_code (
        mine_report_submission_status_code,
        description,
        display_order,
        active_ind,
        create_user,
        create_timestamp,
        update_user,
        update_timestamp
    )
VALUES
    (
        'WTD',
        'Withdrawn',
        '50',
        True,
        'system-mds',
        current_timestamp,
        'system-mds',
        current_timestamp
    );