INSERT INTO idir_membership
(	
    idir_membership_name,
	import_users_ind,
    create_user,
    update_user
)
VALUES
    ('CN=EMPR Mines Health\, Safety and Enforcement Division,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds'),
    ('CN=EMPR Mines Competitiveness and Authorizations Division,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds')
ON CONFLICT DO NOTHING;
