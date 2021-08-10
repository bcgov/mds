import requests
import json

from app.config import Config
from app.api.utils.helpers import clean_HTML_string
from app.api.services.nrpti_service import NRPTIService


class EPICEAOService():
  
    def get_for_mine(mine_guid):
        mine = NRPTIService.get_all().get(mine_guid)
        mine_projects = []
        if mine:
            for project_id in mine.get("project_ids", None):
                url = f'{Config.EPIC_API_URL}projects/{project_id}'
                project_info = json.loads(requests.get(url=url).text)
                leg_year_list = project_info.get("legislationYearList", None)
                for year in leg_year_list:
                    leg = project_info.get(f'legislation_{year}')
                    mine_projects.append ({
                        "project_id":project_id,
                        "project_legislation_year": year,
                        "project_lead":leg.get("projectLead", None),
                        "project_lead_email":leg.get("projectLeadEmail", None),
                        "project_lead_phone":leg.get("projectLeadPhone", None),
                        "responsible_EPD":leg.get("responsibleEPD", None),
                        "responsible_EPD_email":leg.get("responsibleEPDEmail", None),
                        "responsible_EPD_phone":leg.get("responsibleEPDPhone", None),
                        "link":f'{Config.EPIC_LINK_URL + project_id}/project-details'
                    })
            return_obj = {'mine_info':{'mine_guid':mine_guid,'summary':clean_HTML_string(mine.get('summary',None)), 'projects':mine_projects}}
        else:
            return_obj={}
        return return_obj
