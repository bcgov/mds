import csv
import hashlib
import io
import json
import logging
import os
import pickle
import shutil
import uuid
from pathlib import Path
from time import sleep
from typing import Any, Dict, List, Optional

import ocrmypdf
import pandas as pd
from app.permit_conditions.context import context
from azure.ai.formrecognizer import AnalyzeResult, DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from haystack import Document, component, logging
from pypdf import PdfReader
from pypdf.errors import PdfReadError

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

@component
class FilterConditionsParagraphsConverter:
    """
    Filters paragraphs from a list of documents to extract only the paragraphs that contain permit conditions.

    Args:
        documents (List[Document]): The list of documents to filter.

    Returns:
        List[Document]: The filtered list of documents in text format.
    """
    @component.output_types(documents=List[Document])
    def run(
        self,
        documents: List[Document],
        meta: Optional[Dict[str, Any]] = None,
        id_hash_keys: Optional[List[str]] = None,
    ) -> List[Document]:
        context.get().update_state(state="PROGRESS", meta={"stage": "filter_conditions_paragraphs"})

        for doc in documents:
            doc.content = json.loads(doc.content)

        filtered_paragraphs = filter_paragraphs(documents)
        docs = []

        cs = self.create_csv_representation(filtered_paragraphs)
        docs = [Document(content=cs, meta={"_type": "csv"})] + docs

        return {"documents": docs}

    def create_csv_representation(self, docs):
        content = []
        for doc in docs:
            cnt = json.loads(doc.content)
            del cnt['role']
            del cnt['sort_key']
            cnt['text'] = f"{cnt['text'][:30]}"
            content.append(cnt)

        if DEBUG_MODE:
            with open("debug/azure_document_intelligence_converter_result.json", "w") as f:
                json.dump(content, f, indent=4)

        content = json.dumps(content)

        jsn = pd.read_json(io.StringIO(content))

        cs = jsn.to_csv(index=False, header=True, quoting=csv.QUOTE_ALL, encoding='utf-8', sep=',', columns=['id', 'indentation', 'text'])
        return cs



# Check if a paragraph is within the page header regions
def is_in_page_header(paragraph, header_regions):
    # Find the maximum top y-coordinate across all bounding regions of the paragraph
    max_paragraph_top_y = max(
        max(point.y for point in region.polygon)
        for region in paragraph.bounding_regions
    )

    # Compare this minimum top y-coordinate with the bottom y-coordinates of the header regions
    for header_region in header_regions:
        header_bottom_y = min(point.y for point in header_region.polygon)
        if max_paragraph_top_y < header_bottom_y:
            # The paragraph is above the bottom of the header region
            return True
    return False


def is_in_page_header(paragraph, max_page_header_y):
    if max_page_header_y is not None:
        bounding_region_polygon = paragraph.bounding_regions[0].polygon
        min_y_coordinate = min(br.y for br in bounding_region_polygon)
        return min_y_coordinate < max_page_header_y
    return False


def filter_paragraphs(paragraphs):
    # Identify the bottom of the paragraph first paragraph identified by doc intelligence as a page header
    # We use this to filter out paragraphs that are part of the page header
    page_header_bottom = identify_bottom_of_first_page_header(paragraphs)

    if page_header_bottom:
        brs = page_header_bottom.bounding_regions[0].polygon
        max_page_header_y = max([br.y for br in brs])
    else:
        max_page_header_y = None

    # Filter out paragraphs that are part of the page header
    non_header_paragraphs = list(filter(lambda p: not is_in_page_header(p), paragraphs))

    # Find the first paragraph that contains the word "conditions" in it - this is likely the start of the conditions section
    idx_of_conditions_header = next(i for i, p in enumerate(non_header_paragraphs) if "conditions" in p.content.lower())

    # The first condition is likely the next section after the conditions header
    first_condition_index = next((i for i, p in enumerate(non_header_paragraphs[idx_of_conditions_header:]) if p.role in ("title", "sectionHeading")), None)

    filtered_paragraphs = non_header_paragraphs[first_condition_index:]

    filterf = ["pageNumber", "footnote", "pageFooter"]

    if max_page_header_y is not None:
        filterf.append("pageHeader")

    # Exclude paragraphs that are page numbers, footnotes, or page footers
    filtered_paragraphs = [p for p in filtered_paragraphs if p.role not in filterf]

    logger.info(f"Found {len(filtered_paragraphs)} paragraphs after filtering, {max_page_header_y}")

    return filtered_paragraphs

def identify_bottom_of_first_page_header(paragraphs):
    # Find the first paragraph that is identified as a page header
    is_like_page_header = False

    page_header_start_idx = next((i for i, p in enumerate(paragraphs) if p.role == "pageHeader"), None)

    if page_header_start_idx:
        page_header_end_idx = next((i - 1 for i, p in enumerate(paragraphs[page_header_start_idx:]) if p.role == "pageHeader"), None)

        is_like_page_header = next((True for p in paragraphs[page_header_start_idx:page_header_end_idx] if "permit no" in p.content.lower() or "page" in p.content.lower()), False)
    
        if page_header_start_idx and page_header_end_idx and is_like_page_header:
            brs = paragraphs[page_header_end_idx].bounding_regions[0].polygon
            return max([br.y for br in brs])
    return None
