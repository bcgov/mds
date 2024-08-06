import logging
import os
from pathlib import Path
from time import sleep
from typing import Any, Dict, List, Optional

import ocrmypdf
from app.permit_conditions.context import context
from haystack import Document, component, logging
from pypdf import PdfReader
from pypdf.errors import PdfReadError

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"


@component
class PDFToTextConverter:
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

        if not documents:
            pages = self._read_pdf(
                file_path,
            )

            documents = [
                Document(content=text, meta=meta, id_hash_keys=id_hash_keys)
                for text in pages
            ]

        return {"documents": documents}

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
                    try:
                        page_text = page.extract_text(
                            # extraction_mode="",
                            # layout_mode_space_vertically=False,
                            # layout_mode_scale_weight=0.5,
                        )
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
