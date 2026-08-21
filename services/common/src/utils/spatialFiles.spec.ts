import {
  isRequiredShapefilePart,
  isSingleFileSpatialFilename,
  isSpatialFilename,
  isValidatedSpatialBundleMember,
  spatialBundleIdOf,
  validatedSpatialBundleIds,
} from "./spatialFiles";

describe("isSpatialFilename", () => {
  it("recognises spatial extensions and ignores everything else", () => {
    expect(isSpatialFilename("boundary.shp")).toBe(true);
    expect(isSpatialFilename("BOUNDARY.PRJ")).toBe(true);
    expect(isSpatialFilename("notice.pdf")).toBe(false);
    expect(isSpatialFilename(undefined)).toBe(false);
  });
});

describe("isRequiredShapefilePart", () => {
  it("recognises required shapefile sidecars only", () => {
    expect(isRequiredShapefilePart("boundary.shp")).toBe(true);
    expect(isRequiredShapefilePart("boundary.xml")).toBe(false);
    expect(isRequiredShapefilePart("site.kml")).toBe(false);
  });
});

describe("spatialBundleIdOf", () => {
  it("reads the bundle id off the row or its nested mine document", () => {
    expect(spatialBundleIdOf({ mine_document_bundle_id: 7 })).toBe(7);
    expect(spatialBundleIdOf({ mine_document: { mine_document_bundle_id: 9 } })).toBe(9);
    expect(spatialBundleIdOf({ filename: "boundary.shp" })).toBeUndefined();
    expect(spatialBundleIdOf(undefined)).toBeUndefined();
  });
});

describe("validatedSpatialBundleIds", () => {
  it("keeps only the bundles that carry a validation result", () => {
    const ids = validatedSpatialBundleIds([
      { bundle_id: 7, validation_status: "VALID" },
      { bundle_id: 8, validation_status: "INVALID" },
      { bundle_id: 9, validation_status: null },
      { validation_status: "VALID" },
    ]);

    expect(Array.from(ids)).toEqual(["7", "8"]);
    expect(validatedSpatialBundleIds(undefined).size).toBe(0);
  });
});

describe("isValidatedSpatialBundleMember", () => {
  const validated = validatedSpatialBundleIds([
    { bundle_id: 7, validation_status: "VALID" },
    { bundle_id: 9, validation_status: "INVALID" },
  ]);

  it("accepts spatial files whose bundle has been validated", () => {
    expect(
      isValidatedSpatialBundleMember(
        { filename: "boundary.shp", mine_document_bundle_id: 7 },
        validated
      )
    ).toBe(true);
    // A failed validation still has details worth linking to.
    expect(
      isValidatedSpatialBundleMember(
        { document_name: "site.kml", mine_document: { mine_document_bundle_id: 9 } },
        validated
      )
    ).toBe(true);
  });

  it("ignores spatial files whose bundle has not been processed", () => {
    expect(isValidatedSpatialBundleMember({ filename: "boundary.shp" }, validated)).toBe(false);
    expect(
      isValidatedSpatialBundleMember(
        { filename: "boundary.shp", mine_document_bundle_id: 12 },
        validated
      )
    ).toBe(false);
    expect(
      isValidatedSpatialBundleMember({ filename: "boundary.shp", mine_document_bundle_id: 7 })
    ).toBe(false);
  });

  // .xml is a shapefile sidecar extension, so a plain XML must not be mistaken for one.
  it("ignores documents that are not spatial files", () => {
    expect(
      isValidatedSpatialBundleMember(
        { filename: "metadata.pdf", mine_document_bundle_id: 7 },
        validated
      )
    ).toBe(false);
    expect(isValidatedSpatialBundleMember({ filename: "report.xml" }, validated)).toBe(false);
    expect(isValidatedSpatialBundleMember(undefined, validated)).toBe(false);
  });
});
