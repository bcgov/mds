import { IMineDocument } from "../mineDocument.interface";

export type SpatialValidationStatus = "VALID" | "INVALID" | "UNABLE_TO_VALIDATE";

export interface ISpatialValidationChecks {
  in_bc?: boolean | null;
  bc_albers?: boolean | null;
  file_size_gt_0?: boolean | null;
  missing_extensions?: string[];
  /** Geomark info resource keys, stored as returned */
  geometryType?: string | null;
  numParts?: number | null;
  numVertices?: number | null;
  area?: number | null;
  length?: number | null;
  minimumClearance?: number | null;
  isValid?: boolean | null;
  isSimple?: boolean | null;
  isRobust?: boolean | null;
  validationError?: string | null;
  minX?: number | null;
  minY?: number | null;
  maxX?: number | null;
  maxY?: number | null;
  centroidX?: number | null;
  centroidY?: number | null;
}

export interface ISpatialBundlePurposeCode {
  spatial_bundle_purpose_code: string;
  description: string;
  display_order: number;
  active_ind: boolean;
}

/** Slim document shape returned on a bundle by Core; it carries no mine_guid or versions. */
export type ISpatialBundleDocument = Pick<
  IMineDocument,
  "mine_document_guid" | "document_manager_guid" | "document_name" | "upload_date" | "create_user"
>;

export interface ISpatialBundle {
  bundle_id: string | number;
  bundle_guid?: string;
  document_name?: string;
  name?: string;
  upload_date?: string;
  bundleFiles?: IMineDocument[];
  geomark_id?: string;
  isSingleFile?: boolean;
  validation_status?: SpatialValidationStatus;
  validation_error?: string;
  validation_checks?: ISpatialValidationChecks;
  purpose_codes?: string[];
  docman_bundle_guid?: string;
  bundle_documents?: ISpatialBundleDocument[];
}
