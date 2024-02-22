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


class EDS(ElasticsearchDocumentStore):
    def _construct_dense_query_body(
        self, query_emb, return_embedding, filters = None, top_k = 10
    ):
        qry = super(EDS,self)._construct_dense_query_body(query_emb=query_emb, return_embedding=return_embedding, filters=filters, top_k=top_k)
        qry['highlight'] = {
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

        print(qry)

        return qry

document_store = EDS(
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

    retriever = EmbeddingRetriever(document_store=document_store, embedding_model='sentence-transformers/all-MiniLM-L6-v2', scale_score=False)

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
    # document_store.update_embeddings(retriever=retriever)

    # document_store.delete_all_documents()

    # reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=False)
    join_documents = JoinDocuments(join_mode='reciprocal_rank_fusion')
    ranker = SentenceTransformersRanker(model_name_or_path="cross-encoder/ms-marco-MiniLM-L-12-v2")
    reader = FARMReader(model_name_or_path="deepset/roberta-base-squad2", use_gpu=False)
    querying_pipeline = Pipeline()
    querying_pipeline.add_node(component=sparse_retriever, name="SparseRetriever", inputs=["Query"])
    # querying_pipeline.add_node(component=retriever, name="DenseRetriever", inputs=["Query"])
    # querying_pipeline.add_node(component=join_documents, name="JoinDocuments", inputs=["SparseRetriever", "DenseRetriever"])
    querying_pipeline.add_node(component=ranker, name="Ranker", inputs=["SparseRetriever"])

    return querying_pipeline

class PDFConv(PDFToTextConverter):
    def convert(
        self,
        file_path = None,
        meta = None,
        remove_numeric_tables = None,
        valid_languages = None,
        encoding = None,
        id_hash_keys = None,
        start_page = None,
        end_page = None,
        keep_physical_layout = None,
        sort_by_position = None,
        ocr = None,
        ocr_language = None,
        multiprocessing = None,
        tika_url=None
    ):
        elements = partition_pdf(file_path, stategy='hi_res', hi_res_model_name='detectron2_onnx', include_page_breaks=True)

        content = "\n\n".join([str(el) for el in elements])

        # with open(f'/code/app/{meta["name"]}.txt', 'w') as f:
        #     f.write(content)

        document = Document(content=content, meta=meta, id_hash_keys=id_hash_keys)
        return [document]

class PrePr(PreProcessor):
    def process(self, documents, clean_whitespace=None, clean_header_footer = None, clean_empty_lines= None, remove_substrings = None, split_by= None, split_length = None, split_overlap = None, split_respect_sentence_boundary = None, tokenizer = None, id_hash_keys = None):
        docs = super().process(documents, clean_whitespace, clean_header_footer, clean_empty_lines, remove_substrings, split_by, split_length, split_overlap, split_respect_sentence_boundary, tokenizer, id_hash_keys)

        # content = "\n\n".join([doc.content for doc in docs])
        
        # with open(f'/code/app/{docs[0].meta["name"]}.txt', 'w') as f:
        #     f.write(content)

        return docs


def indexing_pipeline():
    """
    Returns a Pipeline that
    1. expects a PDF document as an input
    2. Converts the PDF to text using OCR (for any images)
    3. PreProcesses the PDF (e.g. cleaning up whitespace), and splits it into chunks to make searching easier
    4. Stores the document in Elasticsearch
    """
    index_pipeline = Pipeline()
    # text_converter = TikaConverter(tika_url='http://tika:9998/tika', timeout=1000)
    
    text_converter = PDFToTextConverter(ocr='auto')
    preprocessor = PrePr(
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
