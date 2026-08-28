import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

from app.common.types.context import context
from app.pipelines.permit_condition_extraction.components.parse_hierarchy import (
    split_numbering,
)
from haystack import Document, component, logging

logger = logging.getLogger(__name__)

DEBUG_MODE = os.environ.get("DEBUG_MODE", "false").lower() == "true"


@component
class FilterConditionsParagraphsConverter:
    """
    Filters paragraphs from a list of documents to extract only the paragraphs that contain permit conditions
    based on the bounding box and the role of the paragraph (title / sectionHeader etc.) identified by Document Intelligence.

        - Try to identify the bounding boxes of the page headers and exclude paragraphs that overlap it.
        - Try to identify the start of the conditions section and exclude paragraphs that come before it.
        - Exclude paragraphs identified with roles we don't care about e.g. (pageNumber, footnote, pageFooter etc.)

    Also adds a csv representation of the filtered paragraphs to the list of documents as the first item so it can be passed along to
    GPT4 to generate questions for each condition.

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
    ) -> dict:
        context.get().update_state(
            state="PROGRESS", meta={"stage": "filter_conditions_paragraphs"}
        )

        for doc in documents:
            doc.content = json.loads(doc.content)

        filtered_paragraphs = filter_paragraphs(documents)

        if DEBUG_MODE:
            with open("debug/filter_conditions.json", "w") as f:
                cnt = [
                    {"meta": d.meta, "content": d.content} for d in filtered_paragraphs
                ]
                f.write(json.dumps(cnt, indent=4))

        for d in filtered_paragraphs:
            d.content = json.dumps(d.content)

        return {"documents": filtered_paragraphs}


def filter_paragraphs(paragraphs):
    # Filter out paragraphs that are part of the page header
    paragraphs, max_page_header_y = _exclude_paragraphs_overlapping_page_header(
        paragraphs
    )

    # Filter out paragraphs that are not part of the conditions section
    paragraphs = _exclude_paragraphs_not_in_conditions_section(paragraphs)

    # Filter out paragraphs that are not paragraphs
    paragraphs = _exclude_paragraphs_with_non_paragraph_roles(
        paragraphs, max_page_header_y
    )

    paragraphs = _exclude_figure_paragraphs(paragraphs)

    logger.info(
        f"Found {len(paragraphs)} paragraphs after filtering, {max_page_header_y}"
    )

    return paragraphs


def _is_in_page_header(paragraph, max_page_header_y):
    if max_page_header_y is not None:
        return paragraph.meta["bounding_box"]["top"] < max_page_header_y
    return False


def _exclude_paragraphs_overlapping_page_header(paragraphs):
    # Identify the bottom of the paragraph first paragraph identified by doc intelligence as a page header
    # We use this to filter out paragraphs that are part of the page header
    max_page_header_y = _identify_bottom_of_first_page_header(paragraphs)

    # Filter out paragraphs that are part of the page header
    non_header_paragraphs = list(
        filter(lambda p: not _is_in_page_header(p, max_page_header_y), paragraphs)
    )

    part_of_header = list(
        filter(lambda p: _is_in_page_header(p, max_page_header_y), paragraphs)
    )

    for p in part_of_header:
        logger.info(f"Excluded paragraph due to header overlap: {p}, y max: {max_page_header_y}")

    if len(non_header_paragraphs) > 0:
        return non_header_paragraphs, max_page_header_y
    return paragraphs, max_page_header_y


def _has_numbering(p):
    p = split_numbering([{'text': p.content['text']}])[0]

    return bool(p['regex'])

def _looks_like_condition_header(role, text):
    """
    Check if the paragraph looks like a condition header based on its role and text.
    So far, we have yet to see a permit that would no have a condition header that does not fall under these criteria.
    """
    return (
        role in ("title", "sectionHeading")
        and len(text.split()) <= 4 # The text is not too long (less than 4 words) - Should cover some variants like "Conditions", "Permit Conditions" or "Terms and Conditions"
        and len(text) < 40 # The text is short (less than 40 characters). If it is longer, it's likely a sentance, not a header.
        and "condition" in text.lower()
    )

def _exclude_paragraphs_not_in_conditions_section(paragraphs):
    # Find the first section header / title that contains the word "conditions" in it - this is likely the start of the conditions section
    idx_of_conditions_header = next(
        (
            i
            for i, p in enumerate(paragraphs)
            if _looks_like_condition_header(
                p.content["role"], p.content["text"]
            )
        ),
        None,
    )

    first_condition_index = 0

    if idx_of_conditions_header is not None:
        # The first condition is likely in the next section after the conditions header, try to find it, either by it being a title, a section header or if it has numbering.
        first_condition_index = next(
            (
                idx_of_conditions_header + i + 1
                for i, p in enumerate(paragraphs[idx_of_conditions_header + 1 :])
                if p.content["role"] in ("title", "sectionHeading") or _has_numbering(p)
            ),
            None,
        )
        if not first_condition_index:
            first_condition_index = idx_of_conditions_header
    filtered_paragraphs = paragraphs[first_condition_index:]

    return filtered_paragraphs

def _exclude_paragraphs_with_non_paragraph_roles(paragraphs, max_page_header_y):
    filterf = ["pageNumber", "footnote", "pageFooter"]

    if max_page_header_y is not None:
        filterf.append("pageHeader")

    return [p for p in paragraphs if p.content["role"] not in filterf]

def _is_normal_paragraph(p):
    return not p.content["role"] or p.content["role"] not in ["pageHeader","pageNumber"] and p.content

def _looks_like_permitted_area_figure(p):
    text = p.content.get("text", "").lower().strip()
    return (
        text.startswith("figure")
        and '°' in text 
        and '"' in text
    )

def _exclude_figure_paragraphs(paragraphs):
    """
    Exclude paragraphs that are figures, i.e. those with a role of 'figure'.
    """
    return [p for p in paragraphs if not _looks_like_permitted_area_figure(p)]

def _identify_bottom_of_first_page_header(paragraphs):
    # Find the first paragraph that is identified as a page header
    is_like_page_header = False


    for page_header_start_idx, p in enumerate(paragraphs):
        if p.content["role"] != "pageHeader":
            continue

        # The header continues until the next paragraph that is not a page header (that's on the same page)
        page_header_end_idx = next(
            (
                page_header_start_idx + i
                for i, end_p in enumerate(paragraphs[page_header_start_idx + 1 :])
                if _is_normal_paragraph(end_p) and end_p.meta["page"] == p.meta["page"]
            ),
            None,
        )

        if page_header_end_idx is None:
            continue

        is_like_page_header = next(
            (
                True
                for p in paragraphs[page_header_start_idx : page_header_end_idx + 1]
                if "permit no" in p.content["text"].lower()
                or "page" in p.content["text"].lower()
            ),
            False,
        )

        if (
            page_header_start_idx is not None
            and page_header_end_idx is not None
            and is_like_page_header
        ):
            return paragraphs[page_header_end_idx].meta["bounding_box"]["bottom"]

    # Document Intelligence does not always tag a page header with the 'pageHeader'
    # role - this has been observed for headers laid out as multi-column tables
    # where the header comes back as several ordinary (role=None) paragraphs instead of one recognized
    # header block. Fall back to detecting a block of boilerplate text that repeats
    # near the top of multiple pages, regardless of the role Document Intelligence
    # assigned it.
    return _identify_bottom_of_repeating_header_fallback(paragraphs)

HEADER_ADJACENCY_TOLERANCE = 0.05


def _normalize_header_text(text):
    return re.sub(r"\s+", " ", text or "").strip().lower()


def _build_repeated_paragraph_texts(paragraphs, min_pages=3):
    """
    Find paragraph text that repeats across several different pages
    """
    text_to_pages = {}
    for p in paragraphs:
        page = p.meta.get("page")
        text = _normalize_header_text(p.content.get("text"))
        if not text or page is None:
            continue
        text_to_pages.setdefault(text, set()).add(page)

    return {text for text, pages in text_to_pages.items() if len(pages) >= min_pages}


def _identify_bottom_of_repeating_header_fallback(paragraphs, min_pages=3):
    """
    Identify the bottom of a repeating header block without relying on Document
    Intelligence's 'pageHeader' role. For each page, checks whether the first
    paragraph on that page is repeated on min_pages. The first
    page/paragraph where this holds is used to compute the header cutoff.
    """
    repeated_texts = _build_repeated_paragraph_texts(paragraphs, min_pages=min_pages)

    if not repeated_texts:
        return None

    seen_pages = set()

    for idx, p in enumerate(paragraphs):
        page = p.meta.get("page")

        if page is None or page in seen_pages:
            continue
        seen_pages.add(page)

        if _normalize_header_text(p.content.get("text")) not in repeated_texts:
            continue

        header_end_idx = idx
        header_bottom = p.meta["bounding_box"]["bottom"]

        for next_idx, next_p in enumerate(paragraphs[idx + 1 :], start=idx + 1):
            if next_p.meta.get("page") != page:
                break

            text_repeats = (
                _normalize_header_text(next_p.content.get("text")) in repeated_texts
            )
            touches_header_block = (
                next_p.meta["bounding_box"]["top"] - header_bottom
                <= HEADER_ADJACENCY_TOLERANCE
            )

            if not text_repeats and not touches_header_block:
                break

            header_end_idx = next_idx
            header_bottom = next_p.meta["bounding_box"]["bottom"]

        return paragraphs[header_end_idx].meta["bounding_box"]["bottom"]

    return None