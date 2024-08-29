import csv
import hashlib
import io
import json
import logging
import os
import pickle
import shutil
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from app.permit_conditions.context import context
from azure.ai.formrecognizer import AnalyzeResult, DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from haystack import Document, component, logging

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

DOCUMENTINTELLIGENCE_ENDPOINT = os.environ.get("DOCUMENTINTELLIGENCE_ENDPOINT")
DOCUMENTINTELLIGENCE_API_KEY = os.environ.get("DOCUMENTINTELLIGENCE_API_KEY")
DOCUMENTINTELLIGENCE_API_VERSION = os.environ.get("DOCUMENTINTELLIGENCE_API_VERSION")


@component
class AzureDocumentIntelligenceConverter:
    """
    Converts a PDF file to text format using Azure Document Intelligence.

    Args:
        file_path (Path): The path to the PDF file.
        meta (Optional[Dict[str, Any]]): Additional metadata for the converted documents.
        id_hash_keys (Optional[List[str]]): List of hash keys for identifying the converted documents.

    Returns:
        List[Document]: The converted documents in text format.
    """

    @component.output_types(
        documents=List[Document], permit_condition_csv=List[Document]
    )
    def run(
        self,
        file_path: Path,
        meta: Optional[Dict[str, Any]] = None,
        id_hash_keys: Optional[List[str]] = None,
    ):
        context.get().update_state(
            state="PROGRESS", meta={"stage": "pdf_to_text_converter"}
        )

        if DEBUG_MODE:
            shutil.rmtree("debug", ignore_errors=True)
            os.makedirs("debug")

        cache_key = hashlib.md5(open(file_path, "rb").read()).hexdigest()

        result = None

        if DEBUG_MODE:
            result = self.retrieve_cached_result(cache_key)

        if not result:
            result = self.run_document_intelligence(file_path)

        if DEBUG_MODE:

            self.write_to_cache(cache_key, result)

        docs = []

        for idx, p in enumerate(result.paragraphs):
            doc = self.add_metadata_to_document(idx, p)

            docs.append(doc)

        permit_condition_csv = _create_csv_representation(docs)

        return {
            "documents": docs,
            "permit_condition_csv": [Document(content=permit_condition_csv)],
        }

    def add_metadata_to_document(self, idx, p):
        # Generate a unique ID for the paragraph that can be used to identify it later
        fle = hashlib.md5(p.content.encode())
        fle.update(str(idx).encode())
        paragraph_id = fle.hexdigest()[:7]

        # Transform bounding box coordinates from a polygon to a rectangle,
        # and add it to the documents metadata
        brs = p.bounding_regions[0].polygon
        x = [br.x for br in brs]
        y = [br.y for br in brs]

        top, right, bottom, left = min(y), max(x), max(y), min(x)

        content = {
            "id": paragraph_id,
            "text": p.content,
            "role": p.role,
            "sort_key": idx + 1,
        }
        # Add a bounding_box metadata field to the paragraph
        meta = {
            "bounding_box": {
                "top": top,
                "right": right,
                "bottom": bottom,
                "left": left,
            },
            "role": p.role,
        }

        return Document(content=json.dumps(content, indent=None), meta=meta)

    def run_document_intelligence(self, file_path):
        document_intelligence_client = DocumentAnalysisClient(
            endpoint=DOCUMENTINTELLIGENCE_ENDPOINT,
            credential=AzureKeyCredential(DOCUMENTINTELLIGENCE_API_KEY),
            api_version=DOCUMENTINTELLIGENCE_API_VERSION,
        )

        with open(file_path, "rb") as f:
            poller = document_intelligence_client.begin_analyze_document(
                "prebuilt-layout",
                document=f,
            )

        result: AnalyzeResult = poller.result()
        return result

    def write_to_cache(self, cache_key, result):
        with open(f"app/cache/{cache_key}.pickle", "wb") as f:
            pickle.dump(result, f, protocol=pickle.HIGHEST_PROTOCOL)

        with open("debug/azure_document_intelligence_result.json", "w") as f:
            dp = [d.to_dict() for d in result.paragraphs]
            json.dump(dp, f, indent=4)

    def retrieve_cached_result(self, cache_key):
        try:
            with open(f"app/cache/{cache_key}.pickle", "rb") as f:
                result = pickle.load(f)
                logger.info("cache entry found")
        except Exception:
            logger.info("No cache entry found. Quering Azure Document Intelligence")
            result = None
        return result


def _create_csv_representation(docs):
    content = json.dumps([json.loads(doc.content) for doc in docs])
    jsn = pd.read_json(io.StringIO(content))

    cs = jsn.to_csv(
        index=False,
        header=True,
        quoting=csv.QUOTE_ALL,
        encoding="utf-8",
        sep=",",
        columns=["id", "text"],
    )
    return cs
