from flask_opentracing import FlaskTracing

from flask import current_app

from app.config import Config


class TracingManager:
    def __init__(self, app=None):
        self.app = app
        self.tracing_enabled = None
        self.tracer = None
        self.flask_tracing = None

        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self.app = app
        self.tracing_enabled = str(app.config['TRACING_ENABLED']) == '1'
        if self.tracing_enabled:
            try:
                app.logger.info("Registering tracer")
                self.tracer = Config.JAEGER_CONFIG.initialize_tracer()
                self.flask_tracing = FlaskTracing(self.tracer, True, app)

                with self.tracer.start_span('TestSpan') as span:
                    span.log_kv({'event': 'test message', 'life': 42})

                    with self.tracer.start_span('ChildSpan', child_of=span) as child_span:
                        span.log_kv({'event': 'down below'})

                app.logger.info("Registered")
            except Exception as e:
                app.logger.error("Error registering Jaeger client", e)
        else:
            app.logger.info("Skipping Jaeger")


    def trace(self, name=None):
        """This function wraps a passed function with a call to the app's registered Jaeger instance
        :param func: Function to be wrapped by calling 
        :type func: func
        :raises e: Client connection exception.
        :return: Wrapped function
        :rtype: func
        """

        def wrap(func):
            def wrapped_f(*args, **kwargs):
                self.app.logger.info("Trace")
               

                _name = name if name is not None else func.__name__
                self.app.logger.debug(f"{_name}")


                if self.flask_tracing is not None:
                    self.app.logger.debug(f"Trace {_name}")

                    with self.tracer.start_span('TestSpan') as span:
                        result = func(*args, **kwargs)
                        span.log_kv({'event': 'begin', 'life': 0})
                        try:
                            result = func(*args, **kwargs)
                            span.log_kv({'event': 'success', 'life': 42})
                            self.app.logger.debug("Success")

                        except Exception as e:
                            span.log_kv({'event': 'error', 'life': -42})
                            raise e
                else:
                    self.app.logger.debug(f"Not Trace {_name}")

                    result = func(*args, **kwargs)
                return result

            return wrapped_f

        return wrap