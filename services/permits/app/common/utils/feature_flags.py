import logging
import os
from enum import Enum

from flagsmith import Flagsmith
from haystack.utils import Secret

logger = logging.getLogger(__name__)


class Feature(str, Enum):
    PERMIT_CONDITION_VALIDATOR = "PERMIT_CONDITION_VALIDATOR"


FLAGSMITH_KEY = Secret.from_env_var("FLAGSMITH_KEY", strict=True)
FLAGSMITH_URL = Secret.from_env_var("FLAGSMITH_URL", strict=True)

flagsmith = Flagsmith(
    environment_key=FLAGSMITH_KEY.resolve_value(),
    api_url=FLAGSMITH_URL.resolve_value(),
)


def is_feature_enabled(feature: Feature) -> bool:
    """
    Check if a feature is enabled based on environment variables.
    
    Args:
        feature: The feature to check
        
    Returns:
        Boolean indicating if the feature is enabled
    """
    env_value = os.environ.get(feature, "false").lower()
    return env_value in ("true", "1", "yes")
