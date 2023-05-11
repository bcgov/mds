import {
  DOCUMENT,
  EXCEL,
  MODERN_EXCEL,
  PDF,
  IMAGE,
  APPLICATION_OCTET_STREAM,
  UNIQUELY_SPATIAL,
  SPATIAL,
} from "@/constants";

export type IAcceptedFileTypes =
  | typeof DOCUMENT
  | typeof EXCEL
  | typeof MODERN_EXCEL
  | typeof PDF
  | typeof IMAGE
  | typeof APPLICATION_OCTET_STREAM
  | typeof UNIQUELY_SPATIAL
  | typeof SPATIAL;
