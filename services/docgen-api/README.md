# DocGen API using Carbone 
Embedded Carbone in a Docker image with simple REST API which provides a mechanism for consumers to store template files, check if a file is already stored using a sha256 hash, and render a stored template file.

## From carbone.io website
_Fast, Simple and Powerful report generator in any format PDF, DOCX, XLSX, ODT, PPTX, ODS [, ...]_

_... using your JSON data as input._

See [carbone.io website](https://carbone.io) for full **Carbone** documentation.

## Endpoints

POST /template
`Stores a template file.

multipart/form-data
template: The template file to be stored. (see https://www.npmjs.com/package/multer)`

GET /template/:sha256
`Returns 200 if the template exists, or 404 if it does not.`

POST /template/:sha256/render
`Returns the rendered Carbone generated document using the specified template and supplied parameters. (see https://carbone.io/api-reference.html#native-api)

application/json
data: The template values to be applied.
options: Carbone options to be applied.
formatters: Carbone formatters to be applied.`
