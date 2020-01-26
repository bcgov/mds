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
};

export const OPEN_DOC = {
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.text-template": ".ott",
  "application/vnd.oasis.opendocument.text-web": ".oth",
  "application/vnd.oasis.opendocument.text-master": ".odm",
};

export const DOCUMENT = { ...PDF, ...DOC, ...OPEN_DOC };
