"""NOW Application Analyzer workflow — DevUI discovery entry point."""

from __future__ import annotations

import json
from typing import Any

from .workflow import workflow  # noqa: F401


def _patch_devui_stream_serializer() -> None:
    """Patch DevUI event serialization to tolerate unknown framework types.

    Some Agent Framework builds can emit events that contain internal Message
    instances. In those cases, model_dump_json() may raise a
    PydanticSerializationError. We fall back to a safe JSON encoding path
    instead of crashing the stream.
    """

    try:
        from agent_framework_devui import _server as devui_server
    except Exception:
        return

    original = getattr(devui_server.DevServer, "_stream_execution", None)
    if original is None:
        return

    async def _safe_stream_execution(self: Any, executor: Any, request: Any):
        try:
            events = []
            conversation_getter = getattr(request, "_get_conversation_id", None)
            conversation_id = conversation_getter() if callable(conversation_getter) else None

            async for event in executor.execute_streaming(request):
                events.append(event)

                if conversation_id and hasattr(event, "type") and event.type == "response.trace.completed":
                    try:
                        trace_data = event.data if hasattr(event, "data") else None
                        if trace_data and isinstance(conversation_id, str):
                            executor.conversation_store.add_trace(conversation_id, trace_data)
                    except Exception:
                        pass

                payload = None
                if hasattr(event, "model_dump_json"):
                    try:
                        payload = event.model_dump_json()  # type: ignore[attr-defined]
                    except Exception:
                        payload = None

                if payload is None and hasattr(event, "to_json") and callable(getattr(event, "to_json", None)):
                    try:
                        payload = event.to_json()  # type: ignore[attr-defined]
                        payload = payload.replace("\n", "").replace("\r", "")
                    except Exception:
                        payload = None

                if payload is None:
                    if isinstance(event, dict):
                        payload = json.dumps(event, default=str)
                    elif hasattr(event, "to_dict") and callable(getattr(event, "to_dict", None)):
                        payload = json.dumps(event.to_dict(), default=str)  # type: ignore[attr-defined]
                    elif hasattr(event, "model_dump") and callable(getattr(event, "model_dump", None)):
                        payload = json.dumps(event.model_dump(mode="python"), default=str)  # type: ignore[attr-defined]
                    else:
                        payload = json.dumps(str(event))

                yield f"data: {payload}\n\n"

            from agent_framework_devui.models import ResponseCompletedEvent

            final_response = await executor.message_mapper.aggregate_to_response(events, request)

            last_seq = 0
            for event in reversed(events):
                sequence_number = getattr(event, "sequence_number", None)
                if isinstance(sequence_number, int):
                    last_seq = sequence_number
                    break

            completed_event = ResponseCompletedEvent(
                type="response.completed",
                response=final_response,
                sequence_number=last_seq + 1,
            )
            yield f"data: {completed_event.model_dump_json()}\n\n"
            yield "data: [DONE]\n\n"
        except Exception:
            async for chunk in original(self, executor, request):
                yield chunk

    setattr(devui_server.DevServer, "_stream_execution", _safe_stream_execution)


_patch_devui_stream_serializer()

__all__ = ["workflow"]
