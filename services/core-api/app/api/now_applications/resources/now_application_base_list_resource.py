from flask_restx import Resource
from sqlalchemy import and_, func, or_
from sqlalchemy_filters import apply_sort, apply_pagination

from app.api.mines.mine.models.mine import Mine
from app.api.now_applications.models import ApplicationsView
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25
SORT_FIELD_DEFAULT = 'received_date'
SORT_DIR_DEFAULT = 'desc'

class NowApplicationBaseListResource(Resource, UserMixin):
    parser = CustomReqparser()

    def _apply_filters_and_pagination(self,
                                      page_number=PAGE_DEFAULT,
                                      page_size=PER_PAGE_DEFAULT,
                                      sort_field=None,
                                      sort_dir=None,
                                      mine_guid=None,
                                      lead_inspector_name=None,
                                      issuing_inspector_name=None,
                                      notice_of_work_type_description=[],
                                      mine_region=[],
                                      mine_name=None,
                                      now_number=None,
                                      mine_search=None,
                                      now_application_status_description=[],
                                      originating_system=[],
                                      submissions_only=None,
                                      import_timestamp_since=None,
                                      update_timestamp_since=None,
                                      application_type=None,
                                      permit_no=None,
                                      party=None,
                                      now_numbers=None):

        filters = []
        base_query = ApplicationsView.query
        if now_numbers is not None:
            filters.append(ApplicationsView.now_number.in_(now_numbers))

        if application_type:
            filters.append(ApplicationsView.application_type_code == application_type)

        if submissions_only:
            filters.append(
                and_(ApplicationsView.originating_system != None,
                     ApplicationsView.originating_system != 'MMS'))

        if mine_guid:
            filters.append(ApplicationsView.mine_guid == mine_guid)

        if lead_inspector_name:
            filters.append(
                func.lower(ApplicationsView.lead_inspector_name).contains(
                    func.lower(lead_inspector_name)))

        if issuing_inspector_name:
            filters.append(
                func.lower(ApplicationsView.issuing_inspector_name).contains(
                    func.lower(issuing_inspector_name)))

        if notice_of_work_type_description:
            filters.append(
                ApplicationsView.notice_of_work_type_description.in_(
                    notice_of_work_type_description))

        if now_number:
            filters.append(ApplicationsView.now_number == now_number)

        if mine_region or mine_search or mine_name:
            base_query = base_query.join(Mine)

        if mine_region:
            filters.append(Mine.mine_region.in_(mine_region))

        if originating_system:
            filters.append(ApplicationsView.originating_system.in_(originating_system))

        if mine_name:
            filters.append(func.lower(Mine.mine_name).contains(func.lower(mine_name)))

        if mine_search:
            filters.append(
                or_(
                    func.lower(ApplicationsView.mine_no).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_name).contains(func.lower(mine_search)),
                    func.lower(Mine.mine_no).contains(func.lower(mine_search))))

        if permit_no:
            filters.append(func.lower(ApplicationsView.source_permit_no).contains(func.lower(str(permit_no))))

        if party:
            filters.append(func.lower(ApplicationsView.party).contains(func.lower(str(party))))

        if now_application_status_description:
            filters.append(
                ApplicationsView.now_application_status_description.in_(
                    now_application_status_description))

        if import_timestamp_since:
            filters.append(ApplicationsView.import_timestamp >= import_timestamp_since)

        if update_timestamp_since:
            filters.append(ApplicationsView.update_timestamp >= update_timestamp_since)
        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = None
            if sort_field in ['mine_region', 'mine_name']:
                sort_criteria = [{'model': 'Mine', 'field': sort_field, 'direction': sort_dir}]
            else:
                sort_criteria = [{
                    'model': 'ApplicationsView',
                    'field': sort_field,
                    'direction': sort_dir,
                }]
            base_query = apply_sort(base_query, sort_criteria)

        return apply_pagination(base_query, page_number, page_size)
