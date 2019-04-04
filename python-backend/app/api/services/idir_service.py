from ldap3 import Server, Connection, ObjectDef, Reader, ALL, NTLM
from flask import current_app

from app.api.users.core.models.idir_user_detail import IdirUserDetail

IDIR_URL = 'plywood.idir.bcgov'

EMPR_DN = "OU=Users,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV"

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

idir_field_map = {
    "bcgov_guid": "bcgovGUID",
    "username": "msDS-PrincipalName",
    "email": "mail",
    "phone_no": "telephoneNumber",
    "title": "title",
    "city": "l",
    "department": "department"
}


class IdirService():
    def search_for_users(basedn):
        server = Server(IDIR_URL, get_info=ALL)
        conn = Connection(
            server, user="IDIR\\CSI_MMPO", password="CPqp1115", authentication=NTLM, auto_bind=True)

        #objectClass
        obj_user = ObjectDef('user', conn)
        r = Reader(conn, obj_user, basedn)
        r.search()

        return [x.entry_attributes_as_dict for x in r]


def get_empr_users_from_idir():
    search_results = IdirService.search_for_users(EMPR_DN)
    empr_users = []
    for idir_user in search_results:
        user = {}
        for core_field, idir_field in idir_field_map.items():
            #everything returned in ldap is a list
            user[core_field] = idir_user[idir_field][0] if idir_user[idir_field] else None
            #deal with phone number
            if idir_field == idir_field_map["phone_no"]:
                user["phone_ext"] = None
                phone = idir_user[idir_field]
                if not phone:
                    continue
                phone = phone[0].split(', Ext. ')
                user["phone_no"] = phone[0]
                if len(phone) > 1:
                    user["phone_ext"] = phone[1]

        for group in idir_user["memberOf"]:
            user["memberOf"] = []
            if group in idir_group_dns.values():
                user["memberOf"].append(group)
        empr_users.append(user)
    current_app.logger.info(empr_users)
    return empr_users


def import_empr_users():
    users = get_empr_users_from_idir()
    for user in users:
        iud = IdirUserDetail.find_by_bcgov_guid(user["bcgov_guid"])
        if not iud:
            #create a new user
            pass
        if iud:
            #update existing user
            pass