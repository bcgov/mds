import os
from pathlib import Path
from unittest.mock import patch, mock_open, MagicMock
import pytest

from app.permit_conditions.converters.pdf_to_text_converter import PDFToTextConverter
from pypdf.errors import PdfReadError
import os

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))

SAMPLE_PDF_PATH = Path(ROOT_DIR + "/sample_pdf.pdf")
SAMPLE_PDF_OCR_PATH = Path(ROOT_DIR + "/sample_pdf_ocr.pdf")

MockDocument = MagicMock()


def test_run_with_valid_pdf():
    converter = PDFToTextConverter()
    result = converter.run(file_path=SAMPLE_PDF_PATH)
    assert len(result["documents"]) == 1
    assert result["documents"][0].content == "Testing permit condition extraction"


def test_run_with_nonexistent_pdf():
    converter = PDFToTextConverter()
    with pytest.raises(FileNotFoundError):
        converter.run(file_path=Path("nonexistent.pdf"))


def test_run_with_pdf_read_error():
    converter = PDFToTextConverter()
    with patch(
        "app.permit_conditions.converters.pdf_to_text_converter.PdfReader"
    ) as mock_pdf_reader:
        mock_pdf_reader.side_effect = PdfReadError("Error reading PDF")
        with pytest.raises(PdfReadError):
            converter.run(file_path=SAMPLE_PDF_PATH)
