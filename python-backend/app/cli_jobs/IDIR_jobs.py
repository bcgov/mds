from app.api.services.idir_service import IdirService

from app.api.utils.apm import register_apm
from flask import current_app

from app.api.utils.include.user_info import User

from app.api.users.core.models.core_user import CoreUser
from app.api.users.core.models.idir_user_detail import IdirUserDetail
from app.api.users.core.models.idir_membership import IdirMembership


@register_apm()
def import_empr_idir_users():
    User._test_mode = True
    idir_membership_groups = [x.idir_membership_name for x in IdirMembership.query.all()]
    users = IdirService.get_empr_users_from_idir(idir_membership_groups)
    existing_count, new_count = 0, 0
    for user in users:
        iud = IdirUserDetail.find_by_bcgov_guid(user["bcgov_guid"])
        if not iud:
            new_cu = CoreUser.create(email=user["email"],
                                     phone_no=user["phone_no"],
                                     add_to_session=False)
            new_iud = IdirUserDetail.create(new_cu,
                                            bcgov_guid=user["bcgov_guid"],
                                            username=user["username"],
                                            title=user["title"],
                                            city=user["city"],
                                            department=user["department"],
                                            add_to_session=False)
            for group in user["memberOf"]:
                membership_group = IdirMembership.find_by_membership_name(group)
                if not membership_group:
                    raise Exception(f"FK Error: membership group={group} doesn't exist in db")
                new_cu.idir_membership.append(membership_group)
            new_cu.save()
            new_count += 1

        if iud:
            #update CoreUser
            iud.core_user.email = user["email"]
            iud.core_user.phone_no = user["phone_no"]
            #update IdirUserDetail
            iud.username = user["username"]
            iud.title = user["title"]
            iud.city = user["city"]
            iud.department = user['department']
            #update Memberships
            iud.core_user.idir_membership = []
            for group in user["memberOf"]:
                membership_group = IdirMembership.find_by_membership_name(group)
                if not membership_group:
                    raise Exception(f"FK Error: membership group={group} doesn't exist in db")
                iud.core_user.idir_membership.append(membership_group)
            iud.save()
            existing_count += 1
            #update existing user

    current_app.logger.info(
        f"import_empr_idir_users: Users Created={new_count}, Users Updated={existing_count}")
