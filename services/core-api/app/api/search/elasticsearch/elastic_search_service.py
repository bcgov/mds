import logging

from elasticsearch import Elasticsearch
from flask import current_app


class ElasticSearchService:
    _client = None

    @classmethod
    def get_client(cls):
        if cls._client is None:
            config = current_app.config
            current_app.logger.info(f"Connecting to Elasticsearch at {config['ELASTICSEARCH_URL']}")
            current_app.logger.info(f"Using CA certs at {config['ELASTICSEARCH_CA_CERTS']}")
            cls._client = Elasticsearch(
                config['ELASTICSEARCH_URL'],
                basic_auth=(config['ELASTICSEARCH_USERNAME'], config['ELASTICSEARCH_PASSWORD']),
                ca_certs=config['ELASTICSEARCH_CA_CERTS'],
                verify_certs=False
            )
        return cls._client

    @classmethod
    def search(cls, index_name, query, size=10):
        client = cls.get_client()
        return client.search(index=index_name, body=query, size=size, ignore_unavailable=True)
