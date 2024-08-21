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
class AzureDocumentIntelligenceConverter:
    """
    Converts a PDF file to text format using Pypdf

    Args:
        file_path (Path): The path to the PDF file.
        meta (Optional[Dict[str, Any]]): Additional metadata for the converted documents.
        id_hash_keys (Optional[List[str]]): List of hash keys for identifying the converted documents.

    Returns:
        List[Document]: The converted documents in text format.
    """

    @component.output_types(documents=List[Document])
    def run(
        self,
        file_path: Path,
        meta: Optional[Dict[str, Any]] = None,
        id_hash_keys: Optional[List[str]] = None,
        documents: Optional[List[Document]] = None,
    ) -> List[Document]:
        context.get().update_state(state="PROGRESS", meta={"stage": "pdf_to_text_converter"})

        if DEBUG_MODE:
            shutil.rmtree('debug', ignore_errors=True)
            os.makedirs('debug')

        cache_key = hashlib.md5(open(file_path,'rb').read()).hexdigest() + "hi"

        result = None
        try:
            with open(f"app/cache/{cache_key}.pickle", "rb") as f:
                result = pickle.load(f)
                logger.info('cache entry found')
        except Exception as e:
            logger.info("No cache entry found. Quering OpenAI")
            result = None

        if not result:
            # For how to obtain the endpoint and key, please see PREREQUISITES above.
            endpoint = "https://mds-doc-intelligence.cognitiveservices.azure.com/" #os.environ["DOCUMENTINTELLIGENCE_ENDPOINT"]
            key = "0ced4fbe91a34255b792ecd3339b130a" #os.environ["DOCUMENTINTELLIGENCE_API_KEY"]

            document_intelligence_client = DocumentAnalysisClient(
                endpoint=endpoint,
                credential=AzureKeyCredential(key),
                api_version='2023-07-31'
            )
            with open(file_path, "rb") as f:
                print(f)
                poller = document_intelligence_client.begin_analyze_document(
                    "prebuilt-layout", document=f,
                )
            
            result: AnalyzeResult = poller.result()



            with open(f"app/cache/{cache_key}.pickle", "wb") as f:
                pickle.dump(result, f, protocol=pickle.HIGHEST_PROTOCOL)

        if DEBUG_MODE:
            with open(f"debug/azure_document_intelligence_result.json", "w") as f:
                dp = [d.to_dict() for d in result.paragraphs]
                json.dump(dp, f, indent=4)
        filtered_paragraphs = build_nested_structure(result.paragraphs)
        docs = []

        min_x = 100000000

        for idx, p in enumerate(filtered_paragraphs):
            fle = hashlib.md5(p['content'].encode())
            fle.update(str(idx).encode())
            parid = fle.hexdigest()[:7]

            content = {"id": parid, "indentation": int(p['left'] * 100), "text": p['content'], "role": p['role'], 'sort_key': idx +1}
            meta = {"bounding_box": {"top": p['top'], "right": p['right'], "bottom": p['bottom'], "left": p['left']}}

            if content['indentation'] < min_x:
                min_x = content['indentation']
            docs.append(Document(content=json.dumps(content, indent=None), meta=meta))

        content = []

        for doc in docs:
            cnt = json.loads(doc.content)
            del cnt['role']
            del cnt['sort_key']
            cnt['text'] = f"{cnt['text'][:30]}"
            content.append(cnt)

        if DEBUG_MODE:
            with open(f"debug/azure_document_intelligence_converter_result.json", "w") as f:
                json.dump(content, f, indent=4)


        content = json.dumps(content)

        jsn = pd.read_json(io.StringIO(content))


        cs = jsn.to_csv(index=False, header=True, quoting=csv.QUOTE_ALL, encoding='utf-8', sep=',', columns=['id', 'indentation', 'text'])

        docs = [Document(content=cs, meta={"_type": "csv"})] + docs

        return {"documents": docs}

    def _ocr_pdf(self, file_path, output_path):
        try:
            ocrmypdf.ocr(file_path, output_path)
        except Exception as e:
            logger.error(f"OCR processing failed for {file_path}: {e}")
            raise

    def _read_pdf(self, file_path: Path) -> List[str]:
        pages = []
        try:
            with open(file_path, "rb") as doc:
                pdf_reader = PdfReader(doc)
                for idx, page in enumerate(pdf_reader.pages):
                    if idx < 100:
                        try:
                            page_text = page.extract_text()
                            pages.append(page_text)
                            if DEBUG_MODE:
                                fn = f"debug/pdfreader-{idx}.txt"
                                os.makedirs(os.path.dirname(fn), exist_ok=True)

                                with open(fn, "w") as debug_doc:
                                    debug_doc.write(page_text)
                        except PdfReadError as e:
                            logger.error(f"Error reading page {idx} of the PDF: {e}")
                            raise
        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            raise
        except PdfReadError as e:
            logger.error(f"Error reading the PDF file: {e}")
            raise
        except Exception as e:
            logger.error(
                f"An unexpected error occurred while reading the PDF file: {e}"
            )
            raise
        return pages

def print_paragraphs(paragraphs, level=0):

    for paragraph in paragraphs:
        role = paragraph.role if paragraph.role else "body"
        indent_level = 0
        if role == "title":
            indent_level = 0
        elif role == "sectionHeading":
            indent_level = 1
        elif role == "footnote":
            indent_level = 2
        elif role == "pageHeader":
            indent_level = 0
        elif role == "pageFooter":
            indent_level = 0
        elif role == "pageNumber":
            indent_level = 0
        else:
            indent_level = 1  # Default indentation for body or undefined roles

    cont = build_nested_structure(paragraphs)

    # print(json.dumps(build_nested_structure(paragraphs), indent=2))

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


def build_nested_structure(paragraphs):
    ps = []
    
    current = None

    filtered_paragraphs = []
    found_conditions = False

    page_header_start = None
    page_header_end = None
    for idx, p in enumerate(paragraphs):
        if p.role == "pageHeader":
            page_header_start = p
        elif page_header_start and p.role and p.role != "pageHeader":
            page_header_end = paragraphs[idx-1]
            break

    if 'permit no' not in page_header_start.content.lower():
        page_header_start = None
        page_header_end = None
        

    if page_header_start and page_header_end:
        brs = page_header_end.bounding_regions[0].polygon
        max_page_header_y = max([br.y for br in brs])
    else:
        max_page_header_y = None

    found_actual_conditions = False


    for paragraph in paragraphs:
        if max_page_header_y is not None:
            brs = paragraph.bounding_regions[0].polygon
            min_y = min([br.y for br in brs])

            if min_y < max_page_header_y:
                logger.info(f"Skipping paragraph in page header: {paragraph.content}")
                continue

        if found_actual_conditions and paragraph.role == "title":
            found_conditions = False
            found_actual_conditions = False
            continue

        if found_conditions and paragraph.role in ("title", "sectionHeading"):
            found_actual_conditions = True

        if paragraph.role in ("title", "sectionHeading") and "conditions" in paragraph.content.lower():
            found_conditions = True
        if found_conditions:
            filtered_paragraphs.append(paragraph)
    logger.info(f"Found {len(filtered_paragraphs)} paragraphs after filtering, {max_page_header_y}")
    filterf = ["pageHeader", "pageNumber"]

    if max_page_header_y is not None:
        filterf.append("pageHeader")

    filtered_paragraphs = [p for p in filtered_paragraphs if p.role not in filterf]

    for paragraph in filtered_paragraphs:
        brs = paragraph.bounding_regions[0].polygon
        x = [br.x for br in brs]
        y = [br.y for br in brs]

        top, right, bottom, left = min(y), max(x), max(y), min(x)

        

        nw = {"content": paragraph.content, "role": paragraph.role, "top": top, "right": right, "bottom": bottom, "left": left, "y": y}
        ps.append(nw)
        # if paragraph.role == "title":
        #     current = nw
        #     ps.append(current)
        # elif paragraph.role == "sectionHeading":
        #     if current is None:
        #         current = nw
        #         ps.append({})
        #     if current['role'] == "title":
        #         current.setdefault("sections", []).append(nw)
        #         current = nw
        #     else:
        #         ps[-1].setdefault("sections", []).append(nw)
        #         current = nw
        # else:
        #     current.setdefault("sections", []).append(nw)            

    return ps

    # top: 1.0122, right: 4.527, bottom: 0.5109, left: 1.2416
#[9.5486, 9.5486, 9.625, 9.625]