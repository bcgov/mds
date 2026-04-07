import os

from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.credentials import AzureKeyCredential

endpoint = os.environ["DOCUMENT_INTELLIGENCE_ENDPOINT"]
key = os.environ["DOCUMENT_INTELLIGENCE_KEY"]

client = DocumentIntelligenceClient(endpoint=endpoint, credential=AzureKeyCredential(key))

# Test connectivity by listing available models
print(f"Connecting to: {endpoint}")
models = client.list_document_models()
print("Connection successful. Available models:")
for model in models:
    print(f"  - {model.model_id}")
