import csv
import io
import json
import logging
import os
from typing import Any, Dict, List, Optional

import pandas as pd
from app.permit_conditions.context import context
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
    ) -> List[Document]:
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
        logger.info(f"Excluded paragraph due to header overlap: {p.content['text']}")

    if len(non_header_paragraphs) > 0:
        return non_header_paragraphs, max_page_header_y
    return paragraphs, max_page_header_y


def _exclude_paragraphs_not_in_conditions_section(paragraphs):
    # Find the first section header / title that contains the word "conditions" in it - this is likely the start of the conditions section
    idx_of_conditions_header = next(
        (
            i
            for i, p in enumerate(paragraphs)
            if "conditions" in p.content["text"].lower()
            and p.content["role"] in ("sectionHeading", "title")
        ),
        None,
    )

    first_condition_index = 0

    if idx_of_conditions_header is not None:
        # The first condition is likely in the next section after the conditions header, try to find it
        first_condition_index = next(
            (
                idx_of_conditions_header + i + 1
                for i, p in enumerate(paragraphs[idx_of_conditions_header + 1 :])
                if p.content["role"] in ("title", "sectionHeading")
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


def _identify_bottom_of_first_page_header(paragraphs):
    # Find the first paragraph that is identified as a page header
    is_like_page_header = False

    page_header_start_idx = next(
        (i for i, p in enumerate(paragraphs) if p.content["role"] == "pageHeader"), None
    )

    if page_header_start_idx is not None:

        page_header_end_idx = next(
            (
                page_header_start_idx + i
                for i, p in enumerate(paragraphs[page_header_start_idx + 1 :])
                if p.content["role"] and p.content["role"] != "pageHeader"
            ),
            None,
        )

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
    return None
