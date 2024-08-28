###
# Utility script to extract permit conditions from PDF documents and validate against expected CSV results.
# Usage: python extract_and_validate_pdf.py --pdf_csv_pairs <pdf_path> <expected_csv_path> --pdf_csv_pairs <pdf_path> <expected_csv_path> ...
###

import argparse
import json
import os
from time import sleep

import oauthlib
from app.compare_extraction_results import validate_condition
from dotenv import find_dotenv, load_dotenv
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

PERMITS_CLIENT_ID = os.getenv("PERMITS_CLIENT_ID", None)
PERMITS_CLIENT_SECRET = os.getenv("PERMITS_CLIENT_SECRET", None)
TOKEN_URL = os.getenv("TOKEN_URL", None)
AUTHORIZATION_URL = os.getenv("AUTHORIZATION_URL", None)
PERMIT_SERVICE_ENDPOINT = os.getenv("PERMIT_SERVICE_ENDPOINT", None)

assert PERMITS_CLIENT_ID, "PERMITS_CLIENT_ID is not set"
assert PERMITS_CLIENT_SECRET, "PERMITS_CLIENT_SECRET is not set"
assert TOKEN_URL, "TOKEN_URL is not set"
assert AUTHORIZATION_URL, "AUTHORIZATION_URL is not set"
assert PERMIT_SERVICE_ENDPOINT, "PERMIT_SERVICE_ENDPOINT is not set"


def authenticate_with_oauth():
    oauth_client = BackendApplicationClient(client_id=PERMITS_CLIENT_ID)
    oauth_session = OAuth2Session(
        client=oauth_client,
    )

    oauth_session.fetch_token(
        TOKEN_URL,
        client_secret=PERMITS_CLIENT_SECRET,
    )
    return oauth_session


def refresh_token(oauth_session):
    oauth_session.fetch_token(
        TOKEN_URL,
        client_secret=PERMITS_CLIENT_SECRET,
    )

    return oauth_session


def request(oauth_session, url, method, **kwargs):
    try:
        response = getattr(oauth_session, method)(url, **kwargs)
        response.raise_for_status()
    except oauthlib.oauth2.rfc6749.errors.TokenExpiredError:
        print("Token expired. Refreshing token...")
        oauth_session = refresh_token(oauth_session)
        response = getattr(oauth_session, method)(url, **kwargs)
        response.raise_for_status()

    return response


def extract_conditions_from_pdf(pdf_path, oauth_session):
    # Kick off the permit conditions extraction process
    with open(pdf_path, "rb") as pdf_file:
        files = {"file": (os.path.basename(pdf_path), pdf_file, "application/pdf")}
        response = request(
            oauth_session,
            f"{PERMIT_SERVICE_ENDPOINT}/permit_conditions",
            "post",
            files=files,
        )
        response.raise_for_status()

    task_id = response.json().get("id")

    if not task_id:
        raise Exception(
            "Failed to extract conditions from PDF. No task ID returned from permit extractions endpoint."
        )

    status = None

    # Poll the status endpoint until the task is complete
    while status not in ("SUCCESS", "FAILURE"):
        sleep(3)
        status_response = request(
            oauth_session,
            f"{PERMIT_SERVICE_ENDPOINT}/permit_conditions/status",
            "get",
            params={"task_id": task_id},
        )
        status_response.raise_for_status()

        status = status_response.json().get("status")

    if status != "SUCCESS":
        raise Exception(f"Failed to extract conditions from PDF. Task status: {status}")

    success_response = oauth_session.get(
        f"{PERMIT_SERVICE_ENDPOINT}/permit_conditions/results/csv",
        params={"task_id": task_id},
    )
    success_response.raise_for_status()

    return success_response.content.decode("utf-8")


# Process each pair of PDF and expected CSV


def extract_and_validate_conditions(pdf_csv_pairs):
    oauth_session = authenticate_with_oauth()

    pairs = []
    for pdf_path, expected_csv_path in pdf_csv_pairs:
        print(f"Processing {pdf_path}...")

        # 1. Extract conditions from PDF
        extracted_csv_content = extract_conditions_from_pdf(pdf_path, oauth_session)

        # 2. Save the extracted CSV content to a temporary file
        extracted_csv_path = f"{os.path.splitext(pdf_path)[0]}_extracted.csv"
        with open(extracted_csv_path, "w") as extracted_csv_file:
            extracted_csv_file.write(extracted_csv_content)

        pairs.append([extracted_csv_path, expected_csv_path])

    # 3. Validate the extracted conditions against the expected CSV results
    validate_condition(pairs)


print(__name__)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Process PDF documents, extract permit conditions, and validate against expected CSV results."
    )
    parser.add_argument(
        "--pdf_csv_pairs",
        nargs=2,
        action="append",
        required=True,
        help="""
            Pairs of PDF file and expected CSV file. Each pair should be specified as two consecutive file paths.
            Usage: python extract_and_validate_pdf.py --pdf_csv_pairs <pdf_path> <expected_csv_path> --pdf_csv_pairs <pdf_path> <expected_csv_path> ...
        """,
    )

    args = parser.parse_args()

    extract_and_validate_conditions(args.pdf_csv_pairs)
