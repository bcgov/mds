INSERT INTO idir_membership
(	
    idir_membership_name,
	import_users_ind,
    create_user,
    update_user
)
VALUES
    ('CN=EMPR MMRD Compliance and Enforcement,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds'),
    ('CN=EMPR MMRD Excluded Managers,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds'),
    ('CN=EMPR MMRD Health Safety and Permitting Branch,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds'),
    ('CN=EMPR MCAD Policy,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds'),
    ('CN=EMPR MMRD Supervisors,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV', 'true', 'system-mds','system-mds')
ON CONFLICT DO NOTHING;
