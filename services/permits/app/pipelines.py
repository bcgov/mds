from haystack import Pipeline
from haystack.document_stores import ElasticsearchDocumentStore
# from haystack.nodes import BM25Retriever,SentenceTransformersRanker
# from haystack.nodes import FARMReader,EmbeddingRetriever
from haystack.components.rankers import TransformersSimilarityRanker

from haystack_integrations.document_stores.elasticsearch import ElasticsearchDocumentStore
from haystack.components.converters import PyPDFToDocument
from haystack_integrations.components.retrievers.elasticsearch import ElasticsearchBM25Retriever

from haystack.components.preprocessors import DocumentCleaner
from haystack.components.preprocessors import DocumentSplitter
from haystack.components.writers import DocumentWriter

import os
import logging
import json

logger = logging.getLogger(__name__)

ca_cert = os.environ.get('ELASTICSEARCH_CA_CERT', None)
host = os.environ.get('ELASTICSEARCH_HOST', 'elasticsearch')
username = os.environ.get('ELASTICSEARCH_USERNAME', '')
password = os.environ.get('ELASTICSEARCH_PASSWORD', '')

document_store = ElasticsearchDocumentStore(
    host=host,
    username=username,
    password=password,
    index="permits",
    embedding_dim=384,
    ca_certs=ca_cert,
    verify_certs=True if ca_cert else False,
    scheme='https' if ca_cert else 'http'
)

def query_pipeline():
    """
    Pipeline that
        1. takes in a text query
        2. retrieves the Top N document matches from Elasticsearch using the BM25 ranking algorithm
        3. runs the documents through the `deepset/roberta-base-squad2` ML model https://huggingface.co/deepset/roberta-base-squad2
        4. returns ranked answers to the given query
    """
    return keyword_search_query_pipeline()

def keyword_search_query_pipeline():
    """
    This pipeline performs a keyword search using BM25 and highlights the search terms in the returned documents
    1. Perform a keyword search using BM25
    2. Re-rank the documents using a cross-encoder model
    """

    # Modify the query sent to elasticsearch to include highlighting of results
    query_with_highligting = {
        "size": 10,
        "query": {
            "bool": {
                "should": [
                    {
                        "multi_match": {
                            "query": "${query}",
                            "type": "most_fields",
                            "fields": ["content", "title"]
                        }
                    }
                ]
            }
        },
        "highlight": {
            "encoder": "html",
            "fields": {
                "content": {
                    "pre_tags" : ["<b><u>"],
                    "post_tags" : ["</u></b>"]
                },
                "title": {
                    "pre_tags" : ["<b><u>"],
                    "post_tags" : ["</u></b>"]
                }
            }
        }
    }

    sparse_retriever = ElasticsearchBM25Retriever(document_store=document_store, custom_query=json.dumps(query_with_highligting).replace('"${query}"', '${query}'))
    ranker = TransformersSimilarityRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-12-v2")
    querying_pipeline = Pipeline()

    querying_pipeline.add_component("retriever", sparse_retriever)
    querying_pipeline.add_component("ranker", ranker)

    return querying_pipeline

def indexing_pipeline():
    """
    Returns a Pipeline that
    1. expects a PDF document as an input
    2. Converts the PDF to text using OCR (for any images)
    3. PreProcesses the PDF (e.g. cleaning up whitespace), and splits it into chunks to make searching easier
    4. Stores the document in Elasticsearch
    """
    index_pipeline = Pipeline()
    
    index_pipeline.add_component("converter", PyPDFToDocument())
    index_pipeline.add_component("cleaner", DocumentCleaner())
    index_pipeline.add_component("splitter", DocumentSplitter(split_by="sentence", split_length=5))
    index_pipeline.add_component("writer", DocumentWriter(document_store=document_store))
    index_pipeline.connect("converter", "cleaner")
    index_pipeline.connect("cleaner", "splitter")
    index_pipeline.connect("splitter", "writer")

    return index_pipeline
