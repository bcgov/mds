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

        paragraphs = result.paragraphs

        # for table in result.tables:
        #     paragraphs = self.replace_paragraphs_with_table(paragraphs, table)

        result.paragraphs = paragraphs

        for idx, p in enumerate(paragraphs):
            doc = self.add_metadata_to_document(idx, p)

            docs.append(doc)

        with open("debug/azure_document_intelligence_repl.json", "w") as f:
            dp = [d.to_dict() for d in result.paragraphs]
            json.dump(dp, f, indent=4)
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

        with open("debug/azure_document_intelligence_result.txt", "w") as f:
            dp = [d.content for d in result.paragraphs]
            f.write("\n".join(dp))

        with open("debug/azure_document_intelligence_result_tables.json", "w") as f:
            dp = [d.to_dict() for d in result.tables]
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


    def replace_paragraphs_with_table(self, paragraphs, table):
        # A paragraph has the following structure (accessed as class properties):
        # {
        #    "content": "abc 123",
        #    "bounding_regions": [
        #        {
        #            "page_number": 48,
        #            "polygon": [
        #                {
        #                    "x": 1.6239,
        #                    "y": 8.0825
        #                },
        #                {
        #                    "x": 7.2495,
        #                    "y": 8.0924
        #                },
        #                {
        #                    "x": 7.2485,
        #                    "y": 8.6889
        #                },
        #                {
        #                    "x": 1.6229,
        #                    "y": 8.679
        #                }
        #            ]
        #        }
        #    ],
        # }

        # A table has the following structure (accessed as class properties):
            # {"cells": [
            # {
            # "kind": "content", - or columnHeader
            # "row_index": 0,
            # "column_index": 0,
            # "row_span": 1,
            # "column_span": 1,
            # "content": "6.",
            # "bounding_regions": [
                # {
                    # "page_number": 11,
                    # "polygon": [
                        # {
                            # "x": 1.1908,
                            # "y": 1.1164
                        # },
                        # {
                            # "x": 1.6108,
                            # "y": 1.1164
                        # },
                        # {
                            # "x": 1.6045,
                            # "y": 1.3546
                        # },
                        # {
                            # "x": 1.1908,
                            # "y": 1.3546
                        # }
                    # ]
                # }
            # ],
            #]}
        table_paragraphs = []
        for cell in table.cells:
            for paragraph in paragraphs:
                if cell.bounding_regions[0].polygon == paragraph.bounding_regions[0].polygon:
                    table_paragraphs.append(paragraph)
        
        logger.info(f"Found {len(table_paragraphs)} paragraphs that are part of a table")

        if table_paragraphs:
            table_data = [["" for _ in range(table.column_count)] for _ in range(table.row_count)]
            for cell in table.cells:
                row_index = cell.row_index
                column_index = cell.column_index
                if row_index < table.row_count and column_index < table.column_count:
                    table_data[row_index][column_index] = cell.content

            table_df = pd.DataFrame(table_data)
            table_text = table_df.to_csv(index=False, header=False, sep='\t')

            new_idx = paragraphs.index(table_paragraphs[0])

            # Create a new paragraph with the table text
            new_paragraph = table_paragraphs[0]
            new_paragraph.content = table_text
            new_paragraph.bounding_regions = table.bounding_regions

            # paragraphs[new_idx] = new_paragraph
            # Replace the original paragraphs with the new paragraph
            paragraphs = [p for idx, p in enumerate(paragraphs) if p not in table_paragraphs or idx == new_idx]

        return paragraphs
        

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
