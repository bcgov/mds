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
        
        with open(file_path, "rb") as doc:
            num_pages = self.num_pages(doc)

        pages = []

        with open(file_path, "rb") as doc:
            pdf_reader = PdfReader(doc)

            for idx,page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                pages.append(page_text)
                with open(f'app/extract/pdfreader-{idx}.txt', "w") as doc:
                    doc.write(page_text)

        # for page_num in range(num_pages):
        #     with open(file_path, "rb") as doc:
        #         output_string = StringIO()

        #         extract_text_to_fp(
        #             doc,
        #             output_string,
        #             caching=False,
        #             codec=None,
        #             laparams=layout_params,
        #             output_type="text",
        #             debug=True,
        #             # page_numbers=[page_num]
        #         )

        #         out = output_string.getvalue()

        #         if out == None or out.strip() == '':
        #             logger.error('No text found in document, performing OCR')
        #             ocrd_pdf = BytesIO()
        #             self._ocr_pdf(file_path, ocrd_pdf)

        #             logger.error('Finished ocr')
        #             output_string = StringIO()
        #             extract_text_to_fp(
        #                 BytesIO(ocrd_pdf.getvalue()),
        #                 output_string,
        #                 caching=False,
        #                 codec=None,
        #                 laparams=layout_params,
        #                 page_numbers=[0],
        #                 output_type="text",
        #                 debug=True
        #             )
        #             out = output_string.getvalue()

        #         with open(f'app/extract/test-{page_num}.txt', "w") as doc:
        #             doc.write(out)

        #         pages.append(out)
        return pages
