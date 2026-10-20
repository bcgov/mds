"""Tool for writing NOW application completeness findings to Excel.

Fills the now_regional_checklist.xlsx template in place: column B holds the
checkbox (a real boolean) and column D holds the one-sentence summary with the
page number. The workbook XML is edited directly because openpyxl drops the
Excel checkbox feature, which turns checkboxes into TRUE/FALSE text and loses
the red conditional formatting.
"""

from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path
from typing import Any, Optional

from lxml import etree

try:
    from openpyxl import load_workbook
except ImportError as e:
    load_workbook = None
    _IMPORT_ERROR = str(e)

_TEMPLATE_PATH = Path(__file__).with_name("now_regional_checklist.xlsx")
_OUTPUT_DIR = Path.cwd() / "reports"
_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
_SHEET_PART = "xl/worksheets/sheet1.xml"
_CHECKBOX_COL = "B"
_SUMMARY_COL = "D"
_LEGEND_VALUES = ("Required", "Maybe Required", "Missing")


def _norm(text: str) -> str:
    """Normalize requirement text so '<=' vs '≤' and spacing differences still match."""
    return " ".join(text.replace("≤", "<=").replace("≥", ">=").split()).lower()


def _col_index(ref: str) -> int:
    letters = re.match(r"[A-Z]+", ref).group(0)
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n


def _get_cell(row: etree._Element, ref: str) -> etree._Element:
    """Return the cell element for ref in row, creating it in column order if missing."""
    target = _col_index(ref)
    for cell in row.findall(f"{{{_NS}}}c"):
        idx = _col_index(cell.get("r"))
        if idx == target:
            return cell
        if idx > target:
            new = etree.Element(f"{{{_NS}}}c", r=ref)
            cell.addprevious(new)
            return new
    return etree.SubElement(row, f"{{{_NS}}}c", r=ref)


def _clear(cell: etree._Element) -> None:
    for child in list(cell):
        cell.remove(child)
    cell.attrib.pop("t", None)


def _set_bool(cell: etree._Element, value: bool) -> None:
    _clear(cell)
    cell.set("t", "b")
    etree.SubElement(cell, f"{{{_NS}}}v").text = "1" if value else "0"


def _set_text(cell: etree._Element, text: str) -> None:
    _clear(cell)
    if not text:
        return
    cell.set("t", "inlineStr")
    is_el = etree.SubElement(cell, f"{{{_NS}}}is")
    t = etree.SubElement(is_el, f"{{{_NS}}}t")
    t.text = text
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")


def _summary_text(finding: dict[str, Any]) -> str:
    """One-sentence summary ending with the page reference, e.g. '... (p. 7).'"""
    summary = (finding.get("summary") or "").strip()
    page = str(finding.get("page_number") or "").strip()
    if summary and page and not re.search(r"\(pp?\.?\s*\d", summary):
        summary = f"{summary.rstrip('.')} (p. {page})."
    return summary


def write_now_checklist_report(
    findings: list[dict[str, Any]],
    output_filename: str = "now_application_completeness_report.xlsx",
    applicant_name: Optional[str] = None,
    now_number: Optional[str] = None,
) -> str:
    """Write NOW application completeness findings to the checklist template.

    Args:
        findings: List of finding records with keys:
            - section: Section name from checklist (column A group, e.g. 'Tier 3')
            - requirement: Requirement text from checklist
            - status: 'True', 'False', or 'N/A'
            - summary: One-sentence summary consistent with the application wording
            - page_number: Page number where evidence was found (optional)
            - is_instruction: True if the row is an instruction/header row (skipped)
        output_filename: Name of output Excel file.
        applicant_name: Unused; the template header area is a colour legend.
        now_number: Unused; the template header area is a colour legend.

    Returns:
        Path to generated Excel file as string.
    """
    if load_workbook is None:
        raise ImportError(f"openpyxl is required to read the template: {_IMPORT_ERROR}")

    # Sections are in column A, checkbox in B, requirement text in C.
    ws = load_workbook(str(_TEMPLATE_PATH))["MX Intake Checklist"]
    # Labels such as 'Map' or 'Reclamation' repeat within a section, so keep every row in order.
    template_map: dict[tuple[str, str], list[int]] = {}
    current_section = ""
    for row_num in range(1, ws.max_row + 1):
        col_a = ws.cell(row=row_num, column=1).value
        col_c = ws.cell(row=row_num, column=3).value
        if isinstance(col_a, str) and col_a.strip() and col_a.strip() not in _LEGEND_VALUES:
            current_section = col_a.strip()
        if isinstance(col_c, str) and col_c.strip() and current_section:
            template_map.setdefault((current_section, _norm(col_c)), []).append(row_num)

    _OUTPUT_DIR.mkdir(exist_ok=True)
    output_path = _OUTPUT_DIR / output_filename

    with zipfile.ZipFile(_TEMPLATE_PATH) as zin:
        sheet = etree.fromstring(zin.read(_SHEET_PART))
        rows = {int(r.get("r")): r for r in sheet.iter(f"{{{_NS}}}row")}

        for finding in findings:
            if not isinstance(finding, dict) or finding.get("is_instruction"):
                continue
            section = (finding.get("section") or "").strip()
            requirement = (finding.get("requirement") or "").strip()
            pending = template_map.get((section, _norm(requirement)))
            row_num = pending.pop(0) if pending else None
            row = rows.get(row_num) if row_num else None
            if row is None:
                continue

            status = (finding.get("status") or "").strip()
            checkbox = _get_cell(row, f"{_CHECKBOX_COL}{row_num}")
            if status == "N/A":
                # Blank (not FALSE) so the red "missing" highlight is not applied.
                _clear(checkbox)
            else:
                _set_bool(checkbox, status == "True")

            summary = _summary_text(finding)
            if status == "N/A" and not summary:
                summary = "N/A"
            _set_text(_get_cell(row, f"{_SUMMARY_COL}{row_num}"), summary)

        sheet_xml = etree.tostring(sheet, xml_declaration=True, encoding="UTF-8", standalone=True)

        with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                data = sheet_xml if item.filename == _SHEET_PART else zin.read(item.filename)
                zout.writestr(item, data)

    return str(output_path)


def parse_findings_from_json(findings_json: str) -> list[dict[str, Any]]:
    """Parse findings from JSON string.

    Args:
        findings_json: JSON string with finding records.

    Returns:
        List of parsed finding dictionaries.
    """
    try:
        return json.loads(findings_json)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid findings JSON: {exc}") from exc
