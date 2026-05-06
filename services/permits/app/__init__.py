import os
from dotenv import find_dotenv, load_dotenv

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

# Set dummy environment variables to allow top-level imports and assertions to pass.
# We apply these if the keys are missing OR if they are empty strings.
dummy_env = {
    "AZURE_API_KEY": "dummy-key",
    "AZURE_BASE_URL": "https://dummy-base.openai.azure.com/",
    "AZURE_DEPLOYMENT_NAME": "dummy-deployment",
    "AZURE_SEARCH_SERVICE_ENDPOINT": "https://dummy-search.search.windows.net",
    "AZURE_SEARCH_API_KEY": "dummy-search-key",
    "AZURE_SEARCH_INDEX_NAME": "permit-conditions",
    "AZURE_SEARCH_DATA_SOURCE": "permit-conditions-data",
    "AZURE_SEARCH_INDEXER_NAME": "permit-conditions-indexer",
    "AZURE_SEARCH_SKILLSET": "permit-conditions-skillset",
    "AZURE_NOW_SEARCH_INDEX_NAME": "dummy-now-index",
    "AZURE_NOW_SEARCH_DATA_SOURCE": "dummy-now-ds",
    "AZURE_NOW_SEARCH_INDEXER_NAME": "dummy-now-indexer",
    "AZURE_NOW_SEARCH_SKILLSET": "dummy-now-skillset",
    "AZURE_STORAGE_CONNECTION_STRING": "DefaultEndpointsProtocol=https;AccountName=dummy;AccountKey=dummy;EndpointSuffix=core.windows.net",
    "AZURE_STORAGE_CONTAINER": "dummy-container",
    "DOCUMENTINTELLIGENCE_ENDPOINT": "https://dummy-di.cognitiveservices.azure.com/",
    "DOCUMENTINTELLIGENCE_API_KEY": "dummy-di-key",
    "FILE_UPLOAD_PATH": "test-app-uploads",
    "FLAGSMITH_KEY": "dummy-flagsmith-key",
    "FLAGSMITH_URL": "https://flagsmith.dummy.com/api/v1/",
}

for key, value in dummy_env.items():
    if not os.environ.get(key):
        os.environ[key] = value
