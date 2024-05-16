from enum import Enum
from flagsmith import Flagsmith
from app.config import Config
from flask import current_app


class Feature(Enum):
    TSF_V2='tsf_v2'
    MAJOR_PROJECT_REPLACE_FILE='major_project_replace_file'
    MINE_APPLICATION_FILE_UDPATE_ALERTS='mine_application_file_update_alerts'
    TRACTION_VERIFIABLE_CREDENTIALS='verifiable_credentials'
    #if enabled the credential offer will be the current development state of all the 2.0 changes, Q1 2024
    VC_MINES_ACT_PERMIT_20='vc_mines_act_permit_20'
    CODE_REQUIRED_REPORTS='code_required-reports'
    PERMIT_DOCUMENT_KEYWORD_SEARCH='permit_document_keyword_search'
    AMS_AGENT='ams_agent'

    def __str__(self):
        return self.value

flagsmith = Flagsmith(
    environment_id = Config.FLAGSMITH_KEY,
    api = Config.FLAGSMITH_URL,
)

def is_feature_enabled(feature):
    try:
        return flagsmith.has_feature(feature) and flagsmith.feature_enabled(feature)
    except Exception as e:
        current_app.logger.error(f'Failed to look up feature flag for: {feature}. ' + str(e))
        return False
