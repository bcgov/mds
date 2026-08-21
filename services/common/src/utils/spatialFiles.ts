// Mirrors SPATIAL_EXTENSIONS in the Document Manager's spatial_bundle_service, which
// determines which files are picked up for bundling and Geomark validation.
export const SPATIAL_BUNDLE_EXTENSIONS = [
  ".shp",
  ".shx",
  ".dbf",
  ".prj",
  ".sbn",
  ".sbx",
  ".xml",
  ".kml",
  ".kmz",
];

// Mirrors SINGLE_FILE_EXTENSIONS in the Document Manager: these carry their geometry on their
// own, so they are never part of a multi-file bundle.
export const SPATIAL_SINGLE_FILE_EXTENSIONS = [".kml", ".kmz"];

export const REQUIRED_SHAPEFILE_EXTENSIONS = [".shp", ".shx", ".dbf", ".prj"];

export const isSpatialFilename = (filename?: string): boolean => {
  if (!filename) {
    return false;
  }
  const lower = filename.toLowerCase();
  return SPATIAL_BUNDLE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const isSingleFileSpatialFilename = (filename?: string): boolean => {
  const lower = (filename || "").toLowerCase();
  return SPATIAL_SINGLE_FILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

export const isRequiredShapefilePart = (filename?: string): boolean => {
  const lower = (filename || "").toLowerCase();
  return REQUIRED_SHAPEFILE_EXTENSIONS.some((ext) => lower.endsWith(ext));
};

/** The bundle a document row belongs to, whether the row is a document or a NoW document xref. */
export const spatialBundleIdOf = (row?: Record<string, any>): string | number | undefined =>
  row?.mine_document_bundle_id ?? row?.mine_document?.mine_document_bundle_id ?? undefined;

/** The bundles the Document Manager has run through Geomark validation, keyed for lookup. */
export const validatedSpatialBundleIds = (bundles?: Record<string, any>[]): Set<string> =>
  new Set(
    (bundles || [])
      .filter((bundle) => bundle?.validation_status && bundle?.bundle_id !== undefined)
      .map((bundle) => String(bundle.bundle_id))
  );

/**
 * Whether a document row belongs to a validated spatial bundle. A spatial extension alone is not
 * enough: only processed and validated bundles have a row in the Spatial Files table to point at.
 */
export const isValidatedSpatialBundleMember = (
  row?: Record<string, any>,
  validatedBundleIds?: Set<string>
): boolean => {
  const bundleId = spatialBundleIdOf(row);
  if (bundleId === undefined || bundleId === null || bundleId === "") {
    return false;
  }
  if (!isSpatialFilename(row?.filename ?? row?.document_name)) {
    return false;
  }
  return Boolean(validatedBundleIds?.has(String(bundleId)));
};
