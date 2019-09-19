/* eslint-disable no-dupe-keys */
export const EXCEL = {
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const PDF = {
  ".pdf": "application/pdf",
};

export const DOC = {
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".rtf": "application/rtf",
};

export const OPEN_DOC = {
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ott": "application/vnd.oasis.opendocument.text-template",
  ".oth": "application/vnd.oasis.opendocument.text-web",
  ".odm": "application/vnd.oasis.opendocument.text-master",
};

export const DOCUMENT = { ...PDF, ...DOC, ...OPEN_DOC };

export const UNIQUELY_SPATIAL = {
  ".dbf": "application/dbf",
  ".geoJSon": "application/vnd.geo+json",
  ".gml": "application/gml+xml",
  ".kml": "application/vnd.google-earth.kml+xml ",
  ".kmz": "application/vnd.google-earth.kmz",
  ".prj": "application/octet-stream",
  ".sbn": "application/octet-stream",
  ".sbx": "application/octet-stream",
  ".shp": "application/octet-stream",
  ".shpz": "application/octet-stream",
  ".shx": "application/octet-stream",
  ".wkt": "application/octet-stream",
};

export const SPATIAL = { ...UNIQUELY_SPATIAL, ".csv": "text/csv", ".xml": "application/xml" };
