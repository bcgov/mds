import requests
import json

from flask import current_app

from app.config import Config


class NRPTIService():
    def get_all():
        url = f'{Config.NRPTI_API_URL}search?dataset=MineBCMI'
        results = requests.get(url=url)
        json_results = json.loads(results.text)
        return_list = {
            mine.get("_sourceRefId", None): {'project_ids':mine.get("_epicProjectIds", None), 'summary':mine.get("summary", None)}
            for mine in json_results[0].get("searchResults", {})
        }
        
        return return_list
