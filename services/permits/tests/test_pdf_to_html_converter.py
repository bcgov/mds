import os
from pathlib import Path
from unittest.mock import MagicMock, mock_open, patch

import pytest
from app.permit_conditions.converters.pdf_to_text_converter import PDFToTextConverter
from app.permit_conditions.tasks.tasks import task_context
from pypdf.errors import PdfReadError
from tests.mocks import MockContext

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

SAMPLE_PDF_PATH = Path(ROOT_DIR + "/sample_pdf.pdf")
SAMPLE_PDF_OCR_PATH = Path(ROOT_DIR + "/sample_pdf_ocr.pdf")

MockDocument = MagicMock()

def test_run_with_valid_pdf():
    with task_context(MockContext()):
        converter = PDFToTextConverter()
        result = converter.run(file_path=SAMPLE_PDF_PATH)
        assert len(result["documents"]) == 1
        assert result["documents"][0].content.strip() == "Testing permit condition extraction"


def test_run_with_nonexistent_pdf():
    with task_context(MockContext()):
        converter = PDFToTextConverter()
        with pytest.raises(FileNotFoundError):
            converter.run(file_path=Path("nonexistent.pdf"))


def test_run_with_pdf_read_error():
    with task_context(MockContext()):
        converter = PDFToTextConverter()
        with patch(
            "app.permit_conditions.converters.pdf_to_text_converter.PdfReader"
        ) as mock_pdf_reader:
            mock_pdf_reader.side_effect = PdfReadError("Error reading PDF")
            with pytest.raises(PdfReadError):
                converter.run(file_path=SAMPLE_PDF_PATH)
