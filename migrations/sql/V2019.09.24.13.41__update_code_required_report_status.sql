INSERT INTO mine_report_submission_status_code
   (
   mine_report_submission_status_code,
   description,
   display_order,
   create_user,
   update_user
   )
VALUES
   ('NRQ', 'Not Requested', 10, 'system-mds', 'system-mds'),
   ('REQ', 'Changes Requested', 20, 'system-mds', 'system-mds'),
   ('REC', 'Changes Received', 30, 'system-mds', 'system-mds');

UPDATE mine_report_submission set mine_report_submission_status_code = 'NRQ' where mine_report_submission_status_code in ('MIA', 'PRE', 'RIP');
UPDATE mine_report_submission set mine_report_submission_status_code = 'REQ' where mine_report_submission_status_code = 'REJ';
