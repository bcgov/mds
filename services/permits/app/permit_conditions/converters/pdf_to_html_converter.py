from io import BytesIO, StringIO, TextIOWrapper
import logging
import os
import warnings
from concurrent.futures import ProcessPoolExecutor
from multiprocessing import cpu_count
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Union

from more_itertools import divide

from haystack import Document, component, logging
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
import ocrmypdf
logger = logging.getLogger(__name__)


@component
class PDFToHTMLConverter():
    @component.output_types(documents=List[Document])
    def run(
        self,
        file_path: Path,
        meta: Optional[Dict[str, Any]] = None,
        id_hash_keys: Optional[List[str]] = None,
    ) -> List[Document]:
        text = self._read_pdf(
            file_path,
        )

        document = Document(content=text, meta=meta, id_hash_keys=id_hash_keys)

        
        return {'documents': [document]}

    def _ocr_pdf(self, file_path, output_path):
        ocrmypdf.ocr(file_path, output_path)


    def _read_pdf(
        self,
        file_path: Path,
        start_page: Optional[int] = None,
    ) -> List[str]:
        logger.error('file_path:')
        logger.error(file_path)
       
        layout_params = LAParams(
            line_overlap=0.5,
            char_margin=2.0,
            line_margin=0.5,
            word_margin=0.1,
            boxes_flow=0.5,
            detect_vertical=True,
            all_texts=False,
        )
        
        output_string = StringIO()

        with open(file_path, "rb") as doc:
            extract_text_to_fp(
                doc,
                output_string,
                caching=False,
                codec=None,
                laparams=layout_params,
                output_type="text",
                debug=True
            )

        out = output_string.getvalue()

        if out == None or out.strip() == '':
            logger.error('No text found in document, performing OCR')
            ocrd_pdf = BytesIO()
            self._ocr_pdf(file_path, ocrd_pdf)

            logger.error('Finished ocr')
            output_string = StringIO()
            extract_text_to_fp(
                BytesIO(ocrd_pdf.getvalue()),
                output_string,
                caching=False,
                codec=None,
                laparams=layout_params,
                output_type="text",
                debug=True
            )
            out = output_string.getvalue()

        with open('app/test.txt', "w") as doc:
            doc.write(out)

        return out
