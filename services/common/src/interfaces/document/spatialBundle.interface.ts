import { IMineDocument } from "../mineDocument.interface";

export type SpatialValidationStatus = "VALID" | "INVALID" | "UNABLE_TO_VALIDATE";

export interface ISpatialValidationChecks {
  in_bc?: boolean | null;
  bc_albers?: boolean | null;
  file_size_gt_0?: boolean | null;
  missing_extensions?: string[];
  geometry_type?: string | null;
  extent?: Record<string, unknown> | null;
  found_projection?: string | null;
  declared_projection?: string | null;
  expected_projection?: string | null;
  /** Geomark attribution: centroid and extent are decimal degrees, area m², length m */
  centroid?: Record<string, unknown> | null;
  num_parts?: number | null;
  num_vertices?: number | null;
  area?: number | null;
  length?: number | null;
  minimum_clearance?: number | null;
  is_valid?: boolean | null;
  is_simple?: boolean | null;
  is_robust?: boolean | null;
  geometry_validation_error?: string | null;
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
  validation_status?: SpatialValidationStatus | string;
  validation_error?: string;
  validation_checks?: ISpatialValidationChecks;
  purpose_codes?: string[];
  docman_bundle_guid?: string;
  bundle_documents?: ISpatialBundleDocument[];
}
