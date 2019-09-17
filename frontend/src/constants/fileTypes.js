/* eslint-disable no-dupe-keys */
export const EXCEL = {
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};
export const PDF = {
  "application/pdf": ".pdf",
};
export const DOC = {
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/rtf": ".rtf",
  "text/rtf": null,
};

export const OPEN_DOC = {
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.text-template": ".ott",
  "application/vnd.oasis.opendocument.text-web": ".oth",
  "application/vnd.oasis.opendocument.text-master": ".odm",
};

export const DOCUMENT = { ...PDF, ...DOC, ...OPEN_DOC };

export const UNIQUELY_SPATIAL = {
  "application/dbf": ".dbf",
  "application/vnd.geo+json ": ".geoJSon",
  "application/gml+xml": ".gml",
  "application/vnd.google-earth.kml+xml ": ".kml",
  "application/vnd.google-earth.kmz": ".kmz",
  "application/octet-stream": ".prj",
  "application/octet-stream": ".sbn",
  "application/octet-stream": ".sbx",
  "application/octet-stream": ".shp",
  "application/octet-stream": ".shpz",
  "application/octet-stream": ".shx",
  "application/octet-stream": ".wkt",
};

export const SPATIAL = { ...UNIQUELY_SPATIAL, "text/csv": ".csv", "application/xml": ".xml" };
