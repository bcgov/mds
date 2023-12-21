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

export const IMAGE = {
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jp2": "image/jp2",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".heic": "image/heic",
  ".heif": "image/heif",
};

export const APPLICATION_OCTET_STREAM = "application/octet-stream";

export const UNIQUELY_SPATIAL = {
  ".dbf": "application/dbf",
  ".geojson": "application/vnd.geo+json",
  ".gml": "application/gml+xml",
  ".kml": "application/vnd.google-earth.kml+xml",
  ".kmz": "application/vnd.google-earth.kmz",
  ".ain": APPLICATION_OCTET_STREAM,
  ".aih": APPLICATION_OCTET_STREAM,
  ".atx": APPLICATION_OCTET_STREAM,
  ".cpg": APPLICATION_OCTET_STREAM,
  ".fbn": APPLICATION_OCTET_STREAM,
  ".fbx": APPLICATION_OCTET_STREAM,
  ".ixs": APPLICATION_OCTET_STREAM,
  ".mxs": APPLICATION_OCTET_STREAM,
  ".prj": APPLICATION_OCTET_STREAM,
  ".sbn": APPLICATION_OCTET_STREAM,
  ".sbx": APPLICATION_OCTET_STREAM,
  ".shp": APPLICATION_OCTET_STREAM,
  ".shpz": APPLICATION_OCTET_STREAM,
  ".shx": APPLICATION_OCTET_STREAM,
  ".wkt": APPLICATION_OCTET_STREAM,
};

export const SPATIAL = {
  ...UNIQUELY_SPATIAL,
  ".csv": "text/csv",
  ".xml": "application/xml",
  ".xml": "text/xml",
};
