UPDATE application_reason_code SET description = 'Update Permittee \ Corporate Name Change' WHERE application_reason_code = 'CHP';
UPDATE application_reason_code SET description = 'Extension to Term' WHERE application_reason_code = 'EXT';
UPDATE application_reason_code SET description = 'MYAB Update \ Change to Bond' WHERE application_reason_code = 'MYA';

INSERT INTO application_reason_code
(
    application_reason_code,
    description,
    create_user,
    update_user,
    active_ind
)
VALUES 
    ('CPP', 'Correction to Previous Permit','system-mds', 'system-mds', 'true')
ON CONFLICT DO NOTHING;