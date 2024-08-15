import os

import elasticsearch
from celery.backends.elasticsearch import ElasticsearchBackend

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", None) or "https://elasticsearch:9200"
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")

scheme, hostname = host.split('://')

backend_url = f'{scheme}://{username}:{password}@{hostname}/celery'

class MDSElasticSearchBackend(ElasticsearchBackend):
    """
    Elasticsearch backend that adds support for the `ca_certs` parameter.
    This is required for connecting to an elasticsearch instance with a self-signed certificate which is the case for us
    """
    def __init__(self, url=None, *args, **kwargs):
        self.url = url
        super().__init__(url=backend_url, *args, **kwargs)

    def _get_server(self):
        http_auth = None
        if self.username and self.password:
            http_auth = (self.username, self.password)

        return elasticsearch.Elasticsearch(
            f'{self.scheme}://{self.host}:{self.port}',
            retry_on_timeout=self.es_retry_on_timeout,
            max_retries=self.es_max_retries,
            timeout=self.es_timeout,
            http_auth=http_auth,
            verify_certs=True if ca_cert else False,
            ca_certs=ca_cert if ca_cert else None,
        )
