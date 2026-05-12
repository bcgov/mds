import os
from dotenv import find_dotenv, load_dotenv

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

# These environment variables are required for the application to function correctly.
# Failing hard here prevents obscure errors later in the application lifecycle.
REQUIRED_VARS = [
    "AZURE_API_KEY",
    "AZURE_BASE_URL",
    "AZURE_DEPLOYMENT_NAME",
    "AZURE_SEARCH_SERVICE_ENDPOINT",
    "AZURE_SEARCH_API_KEY",
    "AZURE_SEARCH_INDEX_NAME",
    "AZURE_SEARCH_DATA_SOURCE",
    "AZURE_SEARCH_INDEXER_NAME",
    "AZURE_SEARCH_SKILLSET",
    "AZURE_NOW_SEARCH_INDEX_NAME",
    "AZURE_NOW_SEARCH_DATA_SOURCE",
    "AZURE_NOW_SEARCH_INDEXER_NAME",
    "AZURE_NOW_SEARCH_SKILLSET",
    "AZURE_STORAGE_CONNECTION_STRING",
    "AZURE_STORAGE_CONTAINER",
    "DOCUMENTINTELLIGENCE_ENDPOINT",
    "DOCUMENTINTELLIGENCE_API_KEY",
    "FLAGSMITH_KEY",
    "FLAGSMITH_URL",
]

missing_vars = [key for key in REQUIRED_VARS if not os.environ.get(key)]

if missing_vars:
    error_msg = f"Required environment variables are missing: {', '.join(missing_vars)}. " \
                "Please ensure these are set in your .env file."
    raise RuntimeError(error_msg)
