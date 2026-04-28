from contextvars import ContextVar

class SafeContext:
    def update_state(self, *args, **kwargs):
        pass

context = ContextVar("permit_conditions_context", default=SafeContext())
