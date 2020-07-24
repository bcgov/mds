from app import make_celery
celery = make_celery()


class ChordFailure(Exception):
    def __init__(self, message):
        self.message = message
        Exception.__init__(self, message)
