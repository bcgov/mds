from enum import Enum
from flagsmith import Flagsmith
from app.config import Config
from flask import current_app


class Feature(Enum):
    TSF_V2='tsf_v2'
    MAJOR_PROJECT_REPLACE_FILE='major_project_replace_file'
    MINE_APPLICATION_FILE_UDPATE_ALERTS='mine_application_file_update_alerts'

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
