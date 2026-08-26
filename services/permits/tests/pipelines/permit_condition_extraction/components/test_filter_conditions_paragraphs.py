import json

from haystack import Document

from app.pipelines.permit_condition_extraction.components.filter_conditions_paragraphs import (
    filter_paragraphs,
)


def _doc(text, role, page, top, bottom):
    doc = Document(
        content=json.dumps(
            {
                "id": f"{page}-{top}-{text[:8]}",
                "text": text,
                "role": role,
                "sort_key": 1,
            }
        ),
        meta={
            "bounding_box": {"top": top, "bottom": bottom, "left": 0, "right": 1},
            "role": role,
            "page": page,
        },
    )
    doc.content = json.loads(doc.content)
    return doc


def test_filter_paragraphs_excludes_header_tagged_with_page_header_role():
    """
    Existing behaviour: Document Intelligence tags the header with role='pageHeader'
    (this is how the old MMO permit template header is classified). This must keep
    working unchanged.
    """
    documents = [
        _doc("CONDITIONS", "sectionHeading", 1, 0.30, 0.34),
        _doc("1. The permittee must do a thing.", None, 1, 0.40, 0.60),
        _doc("Old Co Ltd, Some Mine", "pageHeader", 2, 0.10, 0.20),
        _doc("Permit No. M-1 Page 2 of 2", "pageHeader", 2, 0.20, 0.30),
        _doc("2. The permittee must do another thing.", None, 2, 0.40, 0.60),
    ]

    filtered = filter_paragraphs(documents)
    texts = [d.content["text"] for d in filtered]

    assert "Old Co Ltd, Some Mine" not in texts
    assert "Permit No. M-1 Page 2 of 2" not in texts
    assert "1. The permittee must do a thing." in texts
    assert "2. The permittee must do another thing." in texts


def test_filter_paragraphs_excludes_repeating_header_without_page_header_role():
    """
    Document Intelligence does not tag this table-style, multi-column header with
    role='pageHeader' - it comes back as several ordinary (role=None) paragraphs
    per page instead. The filter must still recognize and exclude it by noticing
    that the same fragments repeat near the top of most pages, even though none of
    them carry the 'pageHeader' role.
    """
    documents = [
        _doc("CONDITIONS", "sectionHeading", 1, 0.30, 0.34),
        _doc("1. The permittee must do a thing.", None, 1, 0.40, 0.60),
    ]

    for page in range(2, 7):
        documents += [
            _doc("Province of British Columbia", None, page, 0.10, 0.14),
            _doc("Mount Polley Mine", None, page, 0.10, 0.14),
            _doc("Permit:", None, page, 0.14, 0.18),
            _doc("M-200", None, page, 0.14, 0.18),
            _doc("Page:", None, page, 0.18, 0.22),
            _doc(f"{page} of 6", None, page, 0.18, 0.22),
            _doc(f"{page}. The permittee must do condition {page}.", None, page, 0.40, 0.60),
        ]

    filtered = filter_paragraphs(documents)
    texts = [d.content["text"] for d in filtered]

    assert "Province of British Columbia" not in texts
    assert "Mount Polley Mine" not in texts
    assert "Permit:" not in texts
    assert "M-200" not in texts
    assert "Page:" not in texts
    for page in range(2, 7):
        assert f"{page} of 6" not in texts

    assert "1. The permittee must do a thing." in texts
    for page in range(2, 7):
        assert f"{page}. The permittee must do condition {page}." in texts

def test_filter_paragraphs_keeps_all_paragraphs_when_no_header_detected():
    """
    If nothing repeats across pages (e.g. a single-page document, or a document
    with no boilerplate header at all), the fallback should not exclude anything -
    it should never remove legitimate content just because it appears more than
    once.
    """
    documents = [
        _doc("CONDITIONS", "sectionHeading", 1, 0.05, 0.10),
        _doc("1. The permittee must do a thing.", None, 1, 0.20, 0.40),
        _doc("2. The permittee must do another thing.", None, 1, 0.40, 0.60),
    ]

    filtered = filter_paragraphs(documents)
    texts = [d.content["text"] for d in filtered]

    assert "1. The permittee must do a thing." in texts
    assert "2. The permittee must do another thing." in texts
