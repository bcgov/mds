from ldap3 import Server, Connection, ObjectDef, Reader, ALL, NTLM
from flask import current_app

IDIR_URL = 'plywood.idir.bcgov'
EMPR_DN = "OU=Users,OU=Energy Mines and Petroleum Resources,OU=BCGOV,DC=idir,DC=BCGOV"

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
        #objectClass
        conn = Connection(
            server,
            user=current_app.config["LDAP_IDIR_USERNAME"],
            password=current_app.config["LDAP_IDIR_PASSWORD"],
            authentication=NTLM,
            auto_bind=True)
        obj_user = ObjectDef('user', conn)
        r = Reader(conn, obj_user, basedn)
        r.search()
        return [x.entry_attributes_as_dict for x in r]

    def get_empr_users_from_idir(membership_groups=[]):
        search_results = IdirService.search_for_users(EMPR_DN)

        empr_users = []
        for idir_user in search_results:
            user = {}
            for core_field, idir_field in idir_field_map.items():
                #everything returned in ldap is a list
                user[core_field] = idir_user[idir_field][0] if idir_user[idir_field] else None

            user["memberOf"] = []
            list_intersect = [
                group for group in idir_user["memberOf"] if group in membership_groups
            ]

            for group in list_intersect:
                user["memberOf"].append(group)

            if (list_intersect and membership_groups) or not membership_groups:
                empr_users.append(user)

        return empr_users
