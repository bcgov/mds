import requests
from datetime import datetime
from flask_restplus import Resource
from app.extensions import jwt, api
from dateutil.relativedelta import relativedelta

from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.nris_services import NRIS_service


class MineComplianceResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'mine_no': 'Mine ID.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_no=None):

        try:
            data = NRIS_service.get_EMPR_data_from_NRIS(mine_no)
        except requests.exceptions.HTTPError as errhttp:
            return self.raise_error(errhttp.response.status_code,
                                    "There has been an unexpected error with NRIS.")
        except requests.exceptions.Timeout as errt:
            return self.raise_error(408, "NRIS has timed out.")

        if len(data) == 0:
            return None
        else:
            data = sorted(
                data,
                key=lambda k: datetime.strptime(k.get('assessmentDate'), '%Y-%m-%d %H:%M'),
                reverse=True)

            most_recent = data[0]

            advisories = 0
            warnings = 0
            open_orders = 0
            overdue_orders = 0
            section_35_orders = 0

            for report in data:
                report_date = datetime.strptime(report.get('assessmentDate'), '%Y-%m-%d %H:%M')
                one_year_ago = datetime.now() - relativedelta(years=1)

                inspection = report.get('inspection')
                stops = inspection.get('stops')

                if stops:
                    stops_dict = stops[0]

                    stop_orders = stops_dict.get('stopOrders')
                    stop_advisories = stops_dict.get('stopAdvisories')
                    stop_warnings = stops_dict.get('stopWarnings')

                    if stop_orders:
                        open_orders += sum(k.get('orderStatus') == 'Open' for k in stop_orders)
                        overdue_orders += sum(
                            k.get('orderCompletionDate') is not None
                            and k.get('orderStatus') == 'Open' and datetime.strptime(
                                k.get('orderCompletionDate'), '%Y-%m-%d %H:%M') < datetime.now()
                            for k in stop_orders)
                        section_35_orders += sum(
                            k.get('orderAuthoritySection') == 'Section 35' for k in stop_orders)

                    if one_year_ago < report_date:
                        advisories += len(stop_advisories)
                        warnings += len(stop_warnings)

            overview = {
                'last_inspection': most_recent.get('assessmentDate'),
                'inspector': most_recent.get('assessor'),
                'open_orders': open_orders,
                'overdue_orders': overdue_orders,
                'advisories': advisories,
                'warnings': warnings,
                'section_35_orders': section_35_orders,
            }

            return overview
