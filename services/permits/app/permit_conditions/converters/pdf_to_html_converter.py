from io import BytesIO, StringIO, TextIOWrapper
import logging
import os
import warnings
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import cpu_count
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Union

from more_itertools import divide
from pdfminer.pdfparser import PDFParser
from pdfminer.pdfdocument import PDFDocument
from pdfminer.pdfpage import PDFPage
from pdfminer.pdfinterp import resolve1
from pypdf import PdfReader
# from nlm_ingestor.ingestor import pdf_ingestor

from haystack import Document, component, logging
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
import ocrmypdf
logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"

@component
class PDFToHTMLConverter():
    @component.output_types(documents=List[Document])
    def run(
        self,
        file_path: Path,
        meta: Optional[Dict[str, Any]] = None,
        id_hash_keys: Optional[List[str]] = None,
        documents: Optional[List[Document]] = None,
    ) -> List[Document]:
        if not documents:
            pages = self._read_pdf(
                file_path,
            )

            documents = [Document(content=text, meta=meta, id_hash_keys=id_hash_keys) for text in pages]
        
        return {'documents': documents}

    def _ocr_pdf(self, file_path, output_path):
        ocrmypdf.ocr(file_path, output_path)


    def num_pages(self, file):
        parser = PDFParser(file)
        document = PDFDocument(parser)

        return resolve1(document.catalog['Pages'])['Count']

    def _read_pdf(
        self,
        file_path: Path,
    ) -> List[str]:

        pages = []

        with open(file_path, "rb") as doc:
            pdf_reader = PdfReader(doc)

            for idx,page in enumerate(pdf_reader.pages):
                page_text = page.extract_text(extraction_mode="layout", layout_mode_space_vertically=False, layout_mode_scale_weight=0.5)

                pages.append(page_text)

                if DEBUG_MODE:
                    with open(f'app/debug/pdfreader-{idx}.txt', "w") as doc:
                        doc.write(page_text)

        return pages
