export const EXCEL = {
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

export const MODERN_EXCEL = {
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

export const XML = {
  ".xml": "application/xml",
};

export const CSV = {
  ".csv": "text/csv",
};

export const OPEN_DOC = {
  ".odt": "application/vnd.oasis.opendocument.text",
  ".ott": "application/vnd.oasis.opendocument.text-template",
  ".oth": "application/vnd.oasis.opendocument.text-web",
  ".odm": "application/vnd.oasis.opendocument.text-master",
};

export const DOCUMENT = { ...PDF, ...DOC, ...OPEN_DOC };

export const IMAGE = {
  ".jpg": "image/jpg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".jp2": "image/jp2",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export const MESSAGE = {
  ".msg": "application/vnd.ms-outlook",
};

export const APPLICATION_OCTET_STREAM = "application/octet-stream";

export const OTHER_SPATIAL = {
  ".dbf": "application/dbf",
  ".kml": "application/vnd.google-earth.kml+xml",
  ".kmz": "application/vnd.google-earth.kmz",
  ".prj": APPLICATION_OCTET_STREAM,
  ".sbn": APPLICATION_OCTET_STREAM,
  ".sbx": APPLICATION_OCTET_STREAM,
  ".shp": APPLICATION_OCTET_STREAM,
  ".shx": APPLICATION_OCTET_STREAM,
};

export const UNIQUELY_SPATIAL = {
  ".geojson": "application/vnd.geo+json",
  ".gml": "application/gml+xml",
  ...OTHER_SPATIAL,
  ".ain": APPLICATION_OCTET_STREAM,
  ".aih": APPLICATION_OCTET_STREAM,
  ".atx": APPLICATION_OCTET_STREAM,
  ".cpg": APPLICATION_OCTET_STREAM,
  ".fbn": APPLICATION_OCTET_STREAM,
  ".fbx": APPLICATION_OCTET_STREAM,
  ".ixs": APPLICATION_OCTET_STREAM,
  ".mxs": APPLICATION_OCTET_STREAM,
  ".shpz": APPLICATION_OCTET_STREAM,
  ".wkt": APPLICATION_OCTET_STREAM,
};

export const SPATIAL = {
  ...UNIQUELY_SPATIAL,
  ...CSV,
  ...XML,
  ".shp.xml": "text/xml",
};
