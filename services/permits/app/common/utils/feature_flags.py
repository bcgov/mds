import logging
from enum import Enum

from flagsmith import Flagsmith
from haystack.utils import Secret

logger = logging.getLogger(__name__)


class Feature(Enum):
    PERMIT_CONDITION_VALIDATOR = 'permit_condition_validator'  # Add validator feature flag
    
    def __str__(self):
        return self.value

FLAGSMITH_KEY = Secret.from_env_var("FLAGSMITH_KEY", strict=True)
FLAGSMITH_URL = Secret.from_env_var("FLAGSMITH_URL", strict=True)

flagsmith = Flagsmith(
    environment_key=FLAGSMITH_KEY.resolve_value(),
    api_url=FLAGSMITH_URL.resolve_value(),
)


def is_feature_enabled(feature):
    try:
        feature = str(feature).strip()
        flags = flagsmith.get_environment_flags()

        return feature in flags.flags and flags.is_feature_enabled(feature)
    except Exception as e:
        logger.error(f'Failed to look up feature flag for: {feature}. ' + str(e))
        return False
