import { getLockedSystemNtrDoc } from "../../utils/helpers";

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

describe("getLockedSystemNtrDoc", () => {
  it("returns null when lockedNtrGuid is null", () => {
    const doc = makeDoc();
    expect(getLockedSystemNtrDoc([doc], null)).toBeNull();
  });

  it("returns null when lockedNtrGuid is undefined", () => {
    const doc = makeDoc();
    expect(getLockedSystemNtrDoc([doc], undefined)).toBeNull();
  });

  it("returns null when documents is empty", () => {
    expect(getLockedSystemNtrDoc([], "target-guid")).toBeNull();
  });

  it("returns null when documents is undefined", () => {
    expect(getLockedSystemNtrDoc(undefined, "target-guid")).toBeNull();
  });

  it("returns null when no document matches the given GUID", () => {
    const doc = makeDoc({ now_application_document_xref_guid: "other-guid" });
    expect(getLockedSystemNtrDoc([doc], "target-guid")).toBeNull();
  });

  it("returns the full document object matching lockedNtrGuid", () => {
    const doc = makeDoc({ now_application_document_xref_guid: "target-guid" });
    const other = makeDoc({ now_application_document_xref_guid: "other-guid" });
    const result = getLockedSystemNtrDoc([other, doc], "target-guid");
    expect(result).toBe(doc);
  });

  it("does not mutate the original documents array", () => {
    const docs = [
      makeDoc({ now_application_document_xref_guid: "a" }),
      makeDoc({ now_application_document_xref_guid: "b" }),
    ];
    const originalOrder = docs.map((d) => d.now_application_document_xref_guid);
    getLockedSystemNtrDoc(docs, "b");
    expect(docs.map((d) => d.now_application_document_xref_guid)).toEqual(originalOrder);
  });
});
