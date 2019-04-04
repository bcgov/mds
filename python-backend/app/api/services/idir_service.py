from ldap3 import Server, Connection, ObjectDef, Reader, ALL, NTLM
from flask import current_app
IDIR_URL = 'plywood.idir.bcgov'

basedn = "OU=Users,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV"

idir_group_dns = {
    "EMPR MMRD Compliance and Enforcement <MMRDCOEN@Victoria1.gov.bc.ca>":
    "CN=EMPR MMRD Compliance and Enforcement,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV",
    "EMPR MMRD Excluded Managers <MMRDEXMG@Victoria1.gov.bc.ca>":
    "CN=EMPR MMRD Excluded Managers,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV",
    "EMPR MMRD Health Safety and Permitting Branch <MMRDHSV@Victoria1.gov.bc.ca>":
    "CN=EMPR MMRD Health Safety and Permitting Branch,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV",
    "EMPR MCAD Policy <MMRDPLCY@Victoria1.gov.bc.ca>":
    "CN=EMPR MCAD Policy,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV",
    "EMPR MMRD Supervisors <MMRDSUP@Victoria1.gov.bc.ca>":
    "CN=EMPR MMRD Supervisors,OU=Distribution Lists,OU=Exchange Objects,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV"
}


class IdirService():
    def test():
        empr_users = []

        server = Server(IDIR_URL, get_info=ALL)
        conn = Connection(
            server, user="IDIR\\CSI_MMPO", password="CPqp1115", authentication=NTLM, auto_bind=True)

        #objectClass
        obj_user = ObjectDef('user', conn)
        r = Reader(conn, obj_user, basedn)
        r.search_level()

        for idir_user in r:
            idir_user_dict = idir_user.entry_attributes_as_dict
            user = {
                'bcgov_guid':
                idir_user_dict['bcgovGUID'][0],
                "username":
                idir_user_dict['msDS-PrincipalName'][0]
                if idir_user_dict['msDS-PrincipalName'] else None,
                "email":
                idir_user_dict['mail'][0] if idir_user_dict['mail'] else None,
                "phone_no":
                idir_user_dict['telephoneNumber'][0].split(',')[0]
                if idir_user_dict['telephoneNumber'] else None,
                "phone_ext":
                idir_user_dict['telephoneNumber'][0].split(',')[1].split('.')[1].strip()
                if idir_user_dict['telephoneNumber']
                and len(idir_user_dict["telephoneNumber"][0].split(',')) > 1 else None,
                "title":
                idir_user_dict["title"][0] if idir_user_dict['title'] else None,
                "city":
                idir_user_dict["l"][0] if idir_user_dict['l'] else None,
                "department":
                idir_user_dict["department"][0] if idir_user_dict['department'] else None,
                "memberOf": []
            }
            for group in idir_user.memberOf:
                if group in idir_group_dns.values():
                    user["memberOf"].append(group)
            empr_users.append(user)
        print([x for x in empr_users])
        #print([x.entry_dn for x in r])
