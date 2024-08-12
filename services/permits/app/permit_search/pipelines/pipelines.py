import logging
import os

from haystack import Pipeline
from haystack.components.converters import PDFMinerToDocument
from haystack.components.preprocessors import DocumentCleaner, DocumentSplitter
from haystack.components.rankers import (
    LostInTheMiddleRanker,
    TransformersSimilarityRanker,
)
from haystack.components.writers import DocumentWriter
from haystack_integrations.components.retrievers.elasticsearch import (
    ElasticsearchBM25Retriever,
)
from haystack_integrations.document_stores.elasticsearch import (
    ElasticsearchDocumentStore,
)

logger = logging.getLogger(__name__)

ca_cert = os.environ.get("ELASTICSEARCH_CA_CERT", None)
host = os.environ.get("ELASTICSEARCH_HOST", "https://elasticsearch:9200")
username = os.environ.get("ELASTICSEARCH_USERNAME", "")
password = os.environ.get("ELASTICSEARCH_PASSWORD", "")


class MDSElasticsearchDocumentStore(ElasticsearchDocumentStore):

    def _deserialize_document(self, hit):
        # Quirk in the ElasticsearchDocumentStore implementation where metadata is not always present
        # causing an error when trying to include highlighted search result
        if hit and "_source" in hit and "metadata" not in hit["_source"]:
            hit["_source"]["metadata"] = {}

        data = super(MDSElasticsearchDocumentStore, self)._deserialize_document(hit)

        if "metadata" in data.meta and "highlighted" in data.meta["metadata"]:
            data.meta["highlighted"] = data.meta["metadata"]["highlighted"]
            del data.meta["metadata"]["highlighted"]

        return data

    def _search_documents(self, **kwargs):
        """
        Searches the documents in Elasticsearch
        """
        if "query" in kwargs:
            query_with_highlighting = {
                "size": 10,
                "highlight": {
                    "encoder": "html",
                    "fields": {
                        "content": {"pre_tags": ["<b><u>"], "post_tags": ["</u></b>"]},
                        "title": {"pre_tags": ["<b><u>"], "post_tags": ["</u></b>"]},
                    },
                },
            }

        return super(MDSElasticsearchDocumentStore, self)._search_documents(
            **(kwargs | query_with_highlighting)
        )


document_store = MDSElasticsearchDocumentStore(
    hosts=[host],
    basic_auth=(username, password) if username and password else None,
    index="permits",
    embedding_similarity_function="cosine",
    ca_certs=ca_cert if ca_cert else None,
    verify_certs=True if ca_cert else False,
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

    sparse_retriever = ElasticsearchBM25Retriever(document_store=document_store)
    try:
        ranker = TransformersSimilarityRanker()
    except ImportError as e:
        logger.error(e)
        ranker = LostInTheMiddleRanker()

    querying_pipeline = Pipeline()

    querying_pipeline.add_component("retriever", sparse_retriever)
    querying_pipeline.add_component("ranker", ranker)

    querying_pipeline.connect("retriever.documents", "ranker.documents")

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

    index_pipeline.add_component("PDFConverter", PDFMinerToDocument())
    index_pipeline.add_component("cleaner", DocumentCleaner())
    index_pipeline.add_component(
        "splitter", DocumentSplitter(split_by="sentence", split_length=5)
    )
    index_pipeline.add_component(
        "writer", DocumentWriter(document_store=document_store)
    )
    index_pipeline.connect("PDFConverter", "cleaner")
    index_pipeline.connect("cleaner", "splitter")
    index_pipeline.connect("splitter", "writer")

    return index_pipeline
