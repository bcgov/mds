from haystack import Pipeline
from haystack.nodes import PDFToTextConverter, PreProcessor

from rest_api.controller.utils import RequestLimiter
from haystack.document_stores import ElasticsearchDocumentStore
from haystack.nodes import BM25Retriever
from haystack.nodes import FARMReader
import os

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
    querying_pipeline = Pipeline()

    retriever = BM25Retriever(document_store=document_store)

    reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=False)
    querying_pipeline = Pipeline()
    querying_pipeline.add_node(component=retriever, name="Retriever", inputs=["Query"])
    querying_pipeline.add_node(component=reader, name="Reader", inputs=["Retriever"])

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

    text_converter = PDFToTextConverter(ocr='auto')
    preprocessor = PreProcessor(
        clean_whitespace=True,
        clean_header_footer=True,
        clean_empty_lines=True,
        split_by="word",
        split_length=200,
        split_overlap=20,
        split_respect_sentence_boundary=True,
    )

    index_pipeline.add_node(component=text_converter, name="TextConverter", inputs=["File"])
    index_pipeline.add_node(component=preprocessor, name="PreProcessor", inputs=["TextConverter"])
    index_pipeline.add_node(component=document_store, name="DocumentStore", inputs=["PreProcessor"])
    return index_pipeline


def request_limiter():
    return RequestLimiter(limit=2)
