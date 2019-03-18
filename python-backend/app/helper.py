from flask import url_for
from flask_restplus import Api as BaseApi


class Api(BaseApi):
    """
    Monkey patch Swagger API to return HTTPS URLs
    """
    @property
    def specs_url(self):
        scheme = 'http' if '5000' in self.base_url else 'https'
        return url_for(self.endpoint('specs'), _external=True, _scheme=scheme)
