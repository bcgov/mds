###
# Utility script to compare extracted permit conditions from CSV files to generate a csv and html report of how well they match
# Usage: python compare_extraction_results.py --csv_pairs <auto_extracted_csv> <manual_extracted_csv> --csv_pairs <auto_extracted_csv> <manual_extracted_csv> ...
# CSV files should have the following columns: section_title, section_paragraph, condition_title, subparagraph, clause, subclause, page_number, condition_text
###
import argparse
import logging
import os

import numpy as np
import pandas as pd
from app.permit_conditions.validator.permit_condition_model import PermitCondition
from diff_match_patch import diff_match_patch
from fuzzywuzzy import fuzz
from jinja2 import Environment, FileSystemLoader
from natsort import natsorted
from pydantic import ValidationError

logger = logging.getLogger(__name__)

# Function to create Content instances from a DataFrame
def create_content_instances(df):
    content_list = []
    for _, row in df.iterrows():
        try:
            content = PermitCondition(
                section_title=row["section_title"],
                section_paragraph=row["section_paragraph"],
                condition_title=row["condition_title"],
                subparagraph=row["subparagraph"],
                clause=row["clause"],
                subclause=row["subclause"],
                paragraph_title=row.get("paragraph_title", ""),
                page_number=int(row["page_number"]) if (row.get("page_number") and row['page_number'] != '') else 0,
                condition_text=row["condition_text"],
                original_condition_text=row["condition_text"],
                subsubclause=row.get('subsubclause', '')
            )
        except ValidationError as e:
            logger.error(f"Failed parsing of permit condition: {e}")
            logger.error(row)
            raise

        # This will be used as the text for comparison purposes
        text = f"""
            {content.section_paragraph}. {content.section_title}
            {content.subparagraph}. {content.condition_title}
            {"("+content.clause + ")" if content.clause else ""} {"("+content.subclause + ")" if content.subclause else ""} {"("+content.subsubclause + ")" if content.subsubclause else ""}

            {content.condition_text}
        """

        content.condition_text = text

        content_list.append(content)
    return content_list


# Create a key for a condition that can be used to easily match and compare conditions between the csvs
def create_comparison_key(condition):
    return ".".join(
        filter(
            None,
            [
                condition.section_paragraph,
                condition.subparagraph,
                condition.clause,
                condition.subclause,
                condition.subsubclause,
            ],
        )
    )


def diff(a, b):
    # Create a html diff between two strings
    dmp = diff_match_patch()
    diffs = dmp.diff_main(b, a)
    return dmp.diff_prettyHtml(diffs)


def write_html_report(context, report_prefix):
    env = Environment(loader=FileSystemLoader("."))
    template = env.get_template("app/report_template.html")

    html_report = template.render(context)

    html_report_filename = f"{report_prefix}_comparison_report.html"
    with open(html_report_filename, "w") as f:
        f.write(html_report)
    return html_report_filename


def write_csv_report(comparison_results, report_prefix):
    np.set_printoptions(linewidth=1000000)

    # Create a DataFrame from the comparison results
    comparison_df = pd.DataFrame(comparison_results)

    comparison_csv_filename = f"{report_prefix}_comparison_report.xlsx"


    comparison_df.to_excel(comparison_csv_filename)

    return comparison_csv_filename


def validate_condition(csv_pairs):
    for csv_pair in csv_pairs:
        auto_extracted_csv, manual_extracted_csv = csv_pair

        # 1. Parse csv files to dicts
        auto_extracted_df = pd.read_csv(
            auto_extracted_csv, dtype=str, keep_default_na=False
        )
        manual_extracted_df = pd.read_csv(
            manual_extracted_csv, dtype=str, keep_default_na=False
        )

        # 2. Parse the data as PermitCondition models
        auto_extracted_content = create_content_instances(auto_extracted_df)
        manual_extracted_content = create_content_instances(manual_extracted_df)

        print(f'Found {len(auto_extracted_content)} conditions in {auto_extracted_csv} and {len(manual_extracted_content)} conditions in {manual_extracted_csv}')

        # 3. Find missing and added conditions
        auto_content_dict = {
            create_comparison_key(content): content
            for content in auto_extracted_content
        }
        manual_content_dict = {
            create_comparison_key(content): content
            for content in manual_extracted_content
        }

        missing_conditions = (
            manual_content_dict.keys() - auto_content_dict.keys()
        )  # Conditions that were not found in the auto extracted csv
        added_conditions = (
            auto_content_dict.keys() - manual_content_dict.keys()
        )  # Conditions that were found in the auto extracted csv, but not in the manual extracted csv

        comparison_results = []

        # Context with data that's passed along to the HTML report
        context = {
            "comparison_results": [],
            "missing_conditions": [],
            "added_conditions": [],
        }

        for key in missing_conditions:
            diff_html = diff("", manual_content_dict[key].condition_text)
            context["missing_conditions"].append(
                {
                    "Key": key,
                    "DiffHTML": diff_html,
                    "state": "missing",
                    "match_percentage": 0,
                }
            )

            comparison_results.append(
                {
                    "Key": key,
                    "auto_section_title": "",
                    "auto_condition_title": "",
                    "auto_extracted_condition": "",
                    "manual_section_title": manual_content_dict[key].section_title,
                    "manual_condition_title": manual_content_dict[key].condition_title,
                    "manual_extracted_condition": manual_content_dict[key].original_condition_text,
                    "match_percentage": 0,
                    "is_match": False,
                }
            )

        for key in added_conditions:
            diff_html = diff(auto_content_dict[key].condition_text, "")
            context["added_conditions"].append(
                {
                    "Key": key,
                    "DiffHTML": diff_html,
                    "state": "added",
                    "match_percentage": 0,
                }
            )

            comparison_results.append(
                {
                    "Key": key,
                    "auto_section_title": auto_content_dict[key].section_title,
                    "auto_condition_title": auto_content_dict[key].condition_title,
                    "auto_extracted_condition": auto_content_dict[key].original_condition_text,
                    "manual_section_title": "",
                    "manual_condition_title": "",
                    "manual_extracted_condition": "",
                    "manual_extracted_condition": "",
                    "match_percentage": 0,
                    "is_match": False,
                }
            )

        # 4. Compare how well the text matches for conditions that are present in both csvs
        match_results = compare_matching_conditions(
            auto_content_dict,
            manual_content_dict,
        )

        context["comparison_results"] += match_results["context_comparison_results"]
        comparison_results += match_results["comparison_results"]

        context["all_conditions"] = natsorted(
            context["comparison_results"]
            + context["missing_conditions"]
            + context["added_conditions"],
            key=lambda x: x["Key"],
        )

        # 5. Calculate the overall match_percentage (how many conditions match 100% between the two csvs)
        total_conditions = (
            match_results["total_comparable_conditions"]
            + len(missing_conditions)
            + len(added_conditions)
        )
        match_percentage = (
            (match_results["matching_score"] / total_conditions) * 100
            if total_conditions > 0
            else 0
        )

        # 6. Create csv and pdf reports
        csv_report_filename, html_report_filename = write_reports(
            auto_extracted_csv, manual_extracted_csv, comparison_results, context
        )

        print(f"Comparison report for {auto_extracted_csv} and {manual_extracted_csv}")
        # Report the results
        print(f"\tThe comparable CSV files match by {match_percentage:.2f}%")
        print(
            f"\tA detailed comparison report has been saved to '{csv_report_filename}'."
        )
        print(
            f"\tAn HTML comparison report has been saved to '{html_report_filename}'."
        )

        # Report missing and added conditions
        print(f"\tMissing conditions (in manual but not in auto): {missing_conditions}")
        print(f"\tAdded conditions (in auto but not in manual): {added_conditions}\n\n")


def compare_matching_conditions(
    auto_content_dict,
    manual_content_dict,
):
    context_comparison_results = []
    comparison_results = []
    total_comparable_conditions = 0
    matching_score = 0

    
    # Compare how well the text matches for conditions that are present in both csvs
    # and gemerate a html diff for each pair of conditions
    for key in sorted(manual_content_dict.keys()):
        if key in auto_content_dict:
            total_comparable_conditions += 1
            auto_condition_text = auto_content_dict[key].condition_text
            manual_condition_text = manual_content_dict[key].condition_text
            match_percentage = fuzz.ratio(auto_condition_text.replace('\n', ''), manual_condition_text.replace('\n', ''))
            is_match = match_percentage >= 100

            if is_match:
                matching_score += 1

            comparison_results.append(
                {
                    "Key": key,
                    "auto_section_title": auto_content_dict[key].section_title,
                    "auto_condition_title": auto_content_dict[key].condition_title,
                    "auto_extracted_condition": auto_content_dict[key].original_condition_text,
                    "manual_section_title": manual_content_dict[key].section_title,
                    "manual_condition_title": manual_content_dict[key].condition_title,
                    "manual_extracted_condition": manual_content_dict[key].original_condition_text,
                    "match_percentage": match_percentage,
                    "is_match": is_match,
                }
            )

            diff_html = diff(auto_condition_text, manual_condition_text)
            context_comparison_results.append(
                {
                    "Key": key,
                    "DiffHTML": diff_html,
                    "state": "match" if is_match else "nomatch",
                    "match_percentage": match_percentage,
                }
            )

    return {
        "comparison_results": comparison_results,
        "matching_score": matching_score,
        "total_comparable_conditions": total_comparable_conditions,
        "context_comparison_results": context_comparison_results,
    }


def write_reports(
    auto_extracted_csv, manual_extracted_csv, comparison_results, context
):
    auto_extracted_base = os.path.splitext(os.path.basename(auto_extracted_csv))[0]
    manual_extracted_base = os.path.splitext(os.path.basename(manual_extracted_csv))[0]

    report_prefix = f"{auto_extracted_base}_vs_{manual_extracted_base}"

    csv_report_filename = write_csv_report(comparison_results, report_prefix)
    html_report_filename = write_html_report(context, report_prefix)
    return csv_report_filename, html_report_filename


if __name__ == "__main__":
    # Set up the argument parser
    parser = argparse.ArgumentParser(
        description="Compare multiple pairs of CSV files containing permit conditions."
    )
    parser.add_argument(
        "--csv_pairs",
        nargs="+",
        action="append",
        help="Pairs of CSV files with automatically and manually extracted conditions. "
        "Each pair should be specified as two consecutive file paths.",
    )
    # Parse the command line arguments
    args = parser.parse_args()

    # Ensure that an even number of CSV file paths have been provided
    if not args.csv_pairs or any(len(pair) != 2 for pair in args.csv_pairs):
        raise ValueError("You must provide pairs of CSV file paths.")

    validate_condition(args.csv_pairs)
