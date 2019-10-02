INSERT INTO public.variance_application_status_code
(variance_application_status_code, description, active_ind, create_user, update_user)
VALUES('WIT', 'Withdrawn', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;