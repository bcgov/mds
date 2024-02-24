# Permit Service

## Overview

The Permit Service is a question-answering (QA) service built on top of deepset-ai's [Haystack framework](https://haystack.deepset.ai/overview/intro). This service leverages state-of-the-art natural language processing (NLP) models to digitize and index Mines Act Permits, and make them discoverable, searchable, and queryable.

## Features

- **Indexing**: Users can use the API to index Permit PDFs to make them searchable
- **OCR**: PDFs can contain either text or images. In case of an Image, the service will use [tesseract-ocr](https://tesseract-ocr.github.io/) to extract text from the PDF
- **NLP Models**: Utilizes deepset-ai's Haystack framework, which supports a variety of powerful NLP models to index the documents
- **Querying**: The service is designed to answer questions posed by users in natural language
- **REST API**: The service exposes Haystack's REST API, that can be used to index documents, query documents, and leave feedback on results
- **Kibana**: The service indexes document in Elasticsearch, and you can use the provided Kibana instance to browse the search index directly.

## Getting Started

### Prerequisites

- Docker
- docker-compose

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/bcgov/mds
   ```

2. Start the service:

   ```bash
   make permits
   ```

The service should now be running and ready to accept user queries.

## Usage

Swagger docs for the service can be found at [http://localhost:8004/haystack/docs](http://localhost:8004/haystack/docs).

### Key endpoints

_Index document_
`POST http://localhost:8004/haystack/file-upload`

This takes in a PDF file and run it through the `indexing` pipeline defined in `app/app.py`. Note: This can take a while depending on your specs.

_Query_
`POST http://localhost:8004/haystack/query`
This endpoint receives the question as a string and allows the requester to set additional parameters that will be passed on to the Haystack query pipeline defined in `app/app.py`. The endpoint performs a Keyword search on indexed documents.

### Kibana

Kibana can be accessed at http://localhost:5601/.

If Kibana prompts you to enter an address for elasticsearch, put in http://elasticsearch:9200. No further setup should be necessary in order to use the app.

In order to view documents in Kibana:

1. Navigate to `Analytics -> Discover`
2. Create a Data View with the Index pattern `permits`

### Permit indexing

The `import_permits.py` utility script is provided to index Permits in bulk from a `csv` file. This script will download the given files
from the source S3 bucket, index the files with the target permit service, and associate the given metadata with the record.

Example usage:

```python
python import_permits.py permits.csv
```

The following environment variables are required:

- OBJECT_STORE_ACCESS_KEY_ID <- ID of S3 access key of the bucket the PDF should be downloaded from
- OBJECT_STORE_ACCESS_KEY <- S3 secret key of the bucket the PDF should be downloaded from
- OBJECT_STORE_HOST
- OBJECT_STORE_BUCKET <- Name of bucket the permit PDFs should be downloaded from
- PERMIT_SERVICE_ENDPOINT <- Endpoint of permit service documents should be indexed with
- PERMITS_CLIENT_ID
- PERMITS_CLIENT_SECRET
- JWT_OIDC_WELL_KNOWN_CONFIG

Example CSV format:

```csv
mine_no,mine_name,permit_no,object_store_path,issue_date,document_name,permit_amendment_guid,permit_amendment_id,description
123,mine1,1234,permits/1234/1234.pdf,2021-01-01,1234.pdf,1234,1234,This is a permit
```

An example query to generate this CSV can be found in the [Metabase Permit Digitization Candidates Metabase collection](https://metabase-4c2ba9-prod.apps.silver.devops.gov.bc.ca/question/2890-mds-permit-digitization-candidates)
