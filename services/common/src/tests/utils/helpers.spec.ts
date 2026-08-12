import { getLockedSystemNtrDoc, getLockedSystemNtrGuid } from "../../utils/helpers";

const makeDoc = (overrides = {}) => ({
  now_application_document_type_code: "NTR",
  now_application_document_xref_guid: "guid-1",
  is_final_package: true,
  is_system_generated: true,
  deleted_ind: false,
  mine_document: { upload_date: "2025-01-01" },
  create_timestamp: "2025-01-01T10:00:00",
  ...overrides,
});

describe("getLockedSystemNtrGuid", () => {
  it("returns null for an empty array", () => {
    expect(getLockedSystemNtrGuid([])).toBeNull();
  });

  it("returns null when documents is undefined", () => {
    expect(getLockedSystemNtrGuid(undefined)).toBeNull();
  });

  it("returns null when no NTR documents exist", () => {
    expect(
      getLockedSystemNtrGuid([makeDoc({ now_application_document_type_code: "OTH" })])
    ).toBeNull();
  });

  it("returns null when NTR is not in the final package", () => {
    expect(getLockedSystemNtrGuid([makeDoc({ is_final_package: false })])).toBeNull();
  });

  it("returns null when NTR is not system-generated", () => {
    expect(getLockedSystemNtrGuid([makeDoc({ is_system_generated: false })])).toBeNull();
  });

  it("returns null when NTR is soft-deleted", () => {
    expect(getLockedSystemNtrGuid([makeDoc({ deleted_ind: true })])).toBeNull();
  });

  it("returns the xref GUID for a single qualifying document", () => {
    const doc = makeDoc({ now_application_document_xref_guid: "target-guid" });
    expect(getLockedSystemNtrGuid([doc])).toBe("target-guid");
  });

  it("returns the GUID of the most recently uploaded document when multiple qualify", () => {
    const older = makeDoc({
      now_application_document_xref_guid: "old-guid",
      create_timestamp: "2024-06-01T08:00:00",
    });
    const newer = makeDoc({
      now_application_document_xref_guid: "new-guid",
      create_timestamp: "2025-01-15T14:30:00",
    });
    expect(getLockedSystemNtrGuid([older, newer])).toBe("new-guid");
  });

  it("handles documents with no mine_document gracefully", () => {
    const doc = makeDoc({ mine_document: null, now_application_document_xref_guid: "no-date-guid" });
    expect(getLockedSystemNtrGuid([doc])).toBe("no-date-guid");
  });

  it("does not mutate the original documents array", () => {
    const docs = [
      makeDoc({ now_application_document_xref_guid: "a", create_timestamp: "2025-01-01T10:00:00" }),
      makeDoc({ now_application_document_xref_guid: "b", create_timestamp: "2024-01-01T10:00:00" }),
    ];
    const originalOrder = docs.map((d) => d.now_application_document_xref_guid);
    getLockedSystemNtrGuid(docs);
    expect(docs.map((d) => d.now_application_document_xref_guid)).toEqual(originalOrder);
  });
});

describe("getLockedSystemNtrDoc", () => {
  it("returns null for empty documents", () => {
    expect(getLockedSystemNtrDoc([])).toBeNull();
    expect(getLockedSystemNtrDoc(undefined)).toBeNull();
  });

  it("returns the full document object, not just the GUID", () => {
    const doc = makeDoc({ now_application_document_xref_guid: "target-guid" });
    const result = getLockedSystemNtrDoc([doc]);
    expect(result).toBe(doc);
  });

  it("returns the most recently uploaded qualifying doc", () => {
    const older = makeDoc({ now_application_document_xref_guid: "old", create_timestamp: "2024-01-01T09:00:00" });
    const newer = makeDoc({ now_application_document_xref_guid: "new", create_timestamp: "2025-06-01T15:00:00" });
    expect(getLockedSystemNtrDoc([older, newer])).toBe(newer);
  });

  it("getLockedSystemNtrGuid delegates to getLockedSystemNtrDoc", () => {
    const doc = makeDoc({ now_application_document_xref_guid: "delegated-guid" });
    expect(getLockedSystemNtrGuid([doc])).toBe("delegated-guid");
  });
});
