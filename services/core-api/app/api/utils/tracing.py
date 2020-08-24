from flask_opentracing import FlaskTracing

from app.config import Config


class TracingManager:
    def __init__(self, app=None):
        self.app = app
        self.tracer = None
        self.flask_tracing = None

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self.tracer = Config.JAEGER_CONFIG.initialize_tracer()
        self.flask_tracing = FlaskTracing(self.tracer, True, app)
