from typing import List
from haystack import Document, Pipeline
from haystack.nodes import PreProcessor, TikaConverter, PDFToTextConverter, JoinDocuments
from haystack.pipelines import DocumentSearchPipeline
from transformers import PreTrainedTokenizerBase
from unstructured.cleaners.core import clean,group_broken_paragraphs
from subprocess import PIPE
from rest_api.controller.utils import RequestLimiter
from haystack.document_stores import ElasticsearchDocumentStore
from haystack.nodes import BM25Retriever,SentenceTransformersRanker
from haystack.nodes import FARMReader,EmbeddingRetriever
from unstructured.partition.pdf import partition_pdf
import os
import logging
import subprocess
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

def sematic_search_query_pipeline():
    """
    This pipeline is a work in progress and just used for testing purposes, but it is intended to be a pipeline that combines a keyword search with a semantic search.
    1. Perform a keyword search using BM25
    2. Permoform a semantic search using a dense embedding model
    3. Combine the results of the two searches using a reciprocal rank fusion
    4. Rank the documents using a cross-encoder model
    """
    dense_retriever = EmbeddingRetriever(document_store=document_store, embedding_model='sentence-transformers/all-MiniLM-L6-v2', scale_score=False)
    document_store.update_embeddings(retriever=dense_retriever, update_existing_embeddings=False)

    sparse_retriever = BM25Retriever(document_store=document_store)
    join_documents = JoinDocuments(join_mode='reciprocal_rank_fusion')
    ranker = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-12-v2")
    
    querying_pipeline = Pipeline()
    querying_pipeline.add_node(component=sparse_retriever, name="SparseRetriever", inputs=["Query"])
    querying_pipeline.add_node(component=dense_retriever, name="DenseRetriever", inputs=["Query"])
    querying_pipeline.add_node(component=join_documents, name="JoinDocuments", inputs=["SparseRetriever", "DenseRetriever"])
    querying_pipeline.add_node(component=ranker, name="Ranker", inputs=["JoinDocuments"])

    return querying_pipeline


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

    sparse_retriever = BM25Retriever(document_store=document_store, custom_query=json.dumps(query_with_highligting).replace('"${query}"', '${query}'))
    ranker = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-12-v2")
    querying_pipeline = Pipeline()
    querying_pipeline.add_node(component=sparse_retriever, name="SparseRetriever", inputs=["Query"])
    querying_pipeline.add_node(component=ranker, name="Ranker", inputs=["SparseRetriever"])

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
        split_length=250,
        split_overlap=32,
        
    )

    index_pipeline.add_node(component=text_converter, name="TextConverter", inputs=["File"])
    index_pipeline.add_node(component=preprocessor, name="PreProcessor", inputs=["TextConverter"])
    index_pipeline.add_node(component=document_store, name="DocumentStore", inputs=["PreProcessor"])
    return index_pipeline


def request_limiter():
    return RequestLimiter(limit=2)
