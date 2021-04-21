update now_application_progress_status set description='Referral' where application_progress_status_code='REF';
delete from now_application_progress_status where application_progress_status_code='VER';
delete from now_application_progress_status where application_progress_status_code='DEC';


INSERT INTO now_application_progress_status (
    application_progress_status_code,
    description,
    create_user,
    update_user
    )
VALUES 
    ('CON', 'Consultation', 'system-mds', 'system-mds'),
    ('PUB', 'Public Comment', 'system-mds', 'system-mds'),
    ('DFT', 'Draft Permit', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;