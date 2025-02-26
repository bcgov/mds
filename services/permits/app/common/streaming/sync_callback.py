import logging
from typing import Any, Callable, Dict, List, Optional

logger = logging.getLogger(__name__)


class SyncStreamingCallback:
    """
    A synchronous callback for streaming LLM results that can be pickled safely.
    This avoids the asyncio.Future pickling error that occurs with the StreamGenerator's callback.
    """

    def __init__(self, callback_fn: Callable[[str], None]):
        self.callback_fn = callback_fn

    def __call__(self, token: str) -> None:
        """
        Process a token by passing it to the callback function.
        This method is called by the LLM component for each generated token.
        """
        try:
            self.callback_fn(token)
        except Exception as e:
            logger.error(f"Error in streaming callback: {str(e)}", exc_info=True)
