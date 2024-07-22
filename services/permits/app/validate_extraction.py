import argparse
from difflib import HtmlDiff, unified_diff
from typing import Optional

import pandas as pd
from fuzzywuzzy import fuzz
from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel


# Define the Pydantic model
class Content(BaseModel):
    section_title: Optional[str] = None
    section_paragraph: Optional[str] = None
    paragraph_title: Optional[str] = None
    subparagraph: Optional[str] = None
    clause: Optional[str] = None
    subclause: Optional[str] = None
    page_number: Optional[str] = None
    condition_text: Optional[str] = None


# Function to create Content instances from a DataFrame
def create_content_instances(df):
    content_list = []
    for _, row in df.iterrows():
        content = Content(
            section_title=row["section_title"],
            section_paragraph=row["section_paragraph"],
            paragraph_title=row["paragraph_title"],
            subparagraph=row["subparagraph"],
            clause=row["clause"],
            subclause=row["subclause"],
            page_number=row["page_number"],
            condition_text=row["condition_text"],
        )
        content_list.append(content)
    return content_list


# Function to create a tuple key from Content instance for comparison
def create_comparison_key(content):
    return ".".join(
        filter(
            None,
            [
                content.section_paragraph,
                content.subparagraph,
                content.clause,
                content.subclause,
            ],
        )
    )


# Set up the argument parser
parser = argparse.ArgumentParser(
    description="Compare two CSV files containing permit conditions."
)
parser.add_argument(
    "auto_extracted_csv",
    type=str,
    help="Path to the CSV file with automatically extracted conditions.",
)
parser.add_argument(
    "manual_extracted_csv",
    type=str,
    help="Path to the CSV file with manually extracted conditions.",
)

# Parse the command line arguments
args = parser.parse_args()

# Read the CSV files
auto_extracted_df = pd.read_csv(
    args.auto_extracted_csv, dtype=str, keep_default_na=False
)
manual_extracted_df = pd.read_csv(
    args.manual_extracted_csv, dtype=str, keep_default_na=False
)

# Create Content instances from the dataframes
auto_extracted_content = create_content_instances(auto_extracted_df)
manual_extracted_content = create_content_instances(manual_extracted_df)

# Create dictionaries for both auto and manual extracted content using the comparison key
auto_content_dict = {
    create_comparison_key(content): content for content in auto_extracted_content
}
manual_content_dict = {
    create_comparison_key(content): content for content in manual_extracted_content
}

missing_conditions = manual_content_dict.keys() - auto_content_dict.keys()
added_conditions = auto_content_dict.keys() - manual_content_dict.keys()

# Initialize a list to store the comparison results
comparison_results = []

# Compare the data and calculate the match score
matching_score = 0
total_comparable_conditions = 0

# Initialize HTML diff instance
html_diff = HtmlDiff(wrapcolumn=80)

# Prepare the HTML report
env = Environment(loader=FileSystemLoader("."))
template = env.get_template("app/report_template.html")
context = {"comparison_results": [], "missing_conditions": [], "added_conditions": []}


def diff(a, b):
    diff = unified_diff(a.splitlines(), b.splitlines(), lineterm="")
    return "\n".join(list(diff))


for key in missing_conditions:
    diff_html = diff("", manual_content_dict[key].condition_text)
    context["missing_conditions"].append(
        {"Key": key, "DiffHTML": diff_html, "state": "missing"}
    )

for key in added_conditions:
    diff_html = diff(auto_content_dict[key].condition_text, "")
    context["added_conditions"].append(
        {"Key": key, "DiffHTML": diff_html, "state": "added"}
    )

for key in sorted(manual_content_dict.keys()):
    if key in auto_content_dict:
        total_comparable_conditions += 1
        auto_condition_text = auto_content_dict[key].condition_text
        manual_condition_text = manual_content_dict[key].condition_text
        # Using fuzzy matching to allow for some differences
        match_percentage = fuzz.ratio(auto_condition_text, manual_condition_text)
        is_match = (
            match_percentage > 90
        )  # Consider it a match if the similarity is above 90%
        if is_match:
            matching_score += 1

        # Append the comparison result to the list
        comparison_results.append(
            {
                "Key": key,
                "auto_extracted_condition": auto_condition_text,
                "manual_extracted_condition": manual_condition_text,
                "match_percentage": match_percentage,
                "is_match": is_match,
            }
        )

        # Add to the HTML report context
        diff_html = diff(auto_condition_text, manual_condition_text)
        context["comparison_results"].append(
            {
                "Key": key,
                "DiffHTML": diff_html,
                "state": "match" if is_match else "nomatch",
            }
        )

for key in missing_conditions:
    comparison_results.append(
        {
            "Key": key,
            "auto_extracted_condition": "N/A",
            "manual_extracted_condition": manual_content_dict[key].condition_text,
            "match_percentage": 0,
            "is_match": False,
        }
    )

for key in added_conditions:
    comparison_results.append(
        {
            "Key": key,
            "auto_extracted_condition": auto_content_dict[key].condition_text,
            "manual_extracted_condition": "N/A",
            "match_percentage": 0,
            "is_match": False,
        }
    )

context["all_conditions"] = sorted(
    (
        context["comparison_results"]
        + context["missing_conditions"]
        + context["added_conditions"]
    ),
    key=lambda c: c.get("Key"),
)

# Render the HTML report
html_report = template.render(context)
with open("comparison_report.html", "w") as f:
    f.write(html_report)

# Calculate the overall match_percentage
total_conditions = (
    total_comparable_conditions + len(missing_conditions) + len(added_conditions)
)
match_percentage = (
    (matching_score / total_conditions) * 100 if total_conditions > 0 else 0
)

# Create a DataFrame from the comparison results
comparison_df = pd.DataFrame(comparison_results)

# Output the detailed comparison report to a CSV file
comparison_df.to_csv("comparison_report.csv", index=False)

# Report the results
print(f"The comparable CSV files match by {match_percentage:.2f}%")
print("A detailed comparison report has been saved to 'comparison_report.csv'.")
print("An HTML comparison report has been saved to 'comparison_report.html'.")

# Report missing and added conditions
print(f"Missing conditions (in manual but not in auto): {missing_conditions}")
print(f"Added conditions (in auto but not in manual): {added_conditions}")
