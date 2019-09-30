UPDATE mine_report_submission set mine_report_submission_status_code = 'NRQ' where mine_report_submission_status_code in ('MIA', 'PRE', 'RIP');
UPDATE mine_report_submission set mine_report_submission_status_code = 'REQ' where mine_report_submission_status_code = 'REJ';

DELETE from mine_report_submission_status_code where mine_report_submission_status_code in ('MIA', 'PRE', 'RIP', 'REJ');