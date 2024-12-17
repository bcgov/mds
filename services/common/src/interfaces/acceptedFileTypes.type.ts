import { APPLICATION_OCTET_STREAM, DOCUMENT, EXCEL, IMAGE, MODERN_EXCEL, PDF, SPATIAL, UNIQUELY_SPATIAL } from "../constants/fileTypes";

export type IAcceptedFileTypes =
  | typeof DOCUMENT
  | typeof EXCEL
  | typeof MODERN_EXCEL
  | typeof PDF
  | typeof IMAGE
  | typeof APPLICATION_OCTET_STREAM
  | typeof UNIQUELY_SPATIAL
  | typeof SPATIAL;
