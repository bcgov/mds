import {
  getNowApplicationDocument,
  getOrderedPermitPackageDocuments,
  getPermitPackageFilesByType,
  getPermitPackageOrderLabel,
} from "../../utils/permitPackageDocuments";

const makeCoreDoc = (overrides = {}) => ({
  now_application_document_type_code: "GDO",
  now_application_document_xref_guid: `guid-${Math.random()}`,
  is_final_package: true,
  is_system_generated: false,
  final_package_order: 1,
  preamble_title: "A Document",
  permit_package_document_type_code: "DOCUMENT",
  mine_document: { document_name: "a.pdf", upload_date: "2025-01-01" },
  ...overrides,
});

const makeNtrDoc = (overrides = {}) => ({
  now_application_document_type_code: "NTR",
  now_application_document_xref_guid: "ntr-guid",
  is_final_package: true,
  is_system_generated: true,
  final_package_order: -1,
  description: "This document was automatically created when Technical Review was completed.",
  mine_document: { upload_date: "2025-01-01" },
  ...overrides,
});

describe("getPermitPackageOrderLabel", () => {
  it("always labels the locked row 1.1", () => {
    expect(getPermitPackageOrderLabel(5, true, true)).toBe("1.1");
    expect(getPermitPackageOrderLabel(0, false, true)).toBe("1.1");
  });

  it("offsets by 1 when a locked row is present", () => {
    expect(getPermitPackageOrderLabel(1, true, false)).toBe("1.2");
    expect(getPermitPackageOrderLabel(2, true, false)).toBe("1.3");
  });

  it("offsets by 2 when no locked row is present (reserves the 1.1 slot)", () => {
    expect(getPermitPackageOrderLabel(0, false, false)).toBe("1.2");
    expect(getPermitPackageOrderLabel(1, false, false)).toBe("1.3");
  });
});

describe("getNowApplicationDocument", () => {
  it("returns nulls for non-NOW applications", () => {
    const result = getNowApplicationDocument({ application_type_code: "AMD", documents: [] }, {});
    expect(result).toEqual({ nowApplicationDocument: null, lockedNtrGuid: null });
  });

  it("returns nulls when there is no system-generated NTR document", () => {
    const result = getNowApplicationDocument(
      { application_type_code: "NOW", documents: [makeCoreDoc()] },
      {}
    );
    expect(result).toEqual({ nowApplicationDocument: null, lockedNtrGuid: null });
  });

  it("returns nulls when technical review has never been completed", () => {
    const ntr = makeNtrDoc({ description: "some other description" });
    const result = getNowApplicationDocument(
      { application_type_code: "NOW", documents: [ntr] },
      {}
    );
    expect(result).toEqual({ nowApplicationDocument: null, lockedNtrGuid: null });
  });

  it("returns the N/A placeholder row when review is complete but locked_ntr_guid isn't set yet", () => {
    const ntr = makeNtrDoc();
    const result = getNowApplicationDocument(
      { application_type_code: "NOW", documents: [ntr], locked_ntr_guid: null },
      {}
    );
    expect(result.lockedNtrGuid).toBeNull();
    expect(result.nowApplicationDocument.now_application_document_xref_guid).toBe(
      "application-form-1.1"
    );
    expect(result.nowApplicationDocument.isLockedApplicationForm).toBe(true);
  });

  it("returns the real locked NTR document when locked_ntr_guid is set", () => {
    const ntr = makeNtrDoc();
    const result = getNowApplicationDocument(
      { application_type_code: "NOW", documents: [ntr], locked_ntr_guid: "ntr-guid" },
      {}
    );
    expect(result.lockedNtrGuid).toBe("ntr-guid");
    expect(result.nowApplicationDocument.isLockedApplicationForm).toBe(true);
    expect(result.nowApplicationDocument.preamble_title).toBe("Notice of Work Application");
  });
});

describe("getOrderedPermitPackageDocuments", () => {
  it("labels documents 1.2, 1.3... when the locked row is present", () => {
    const ntr = makeNtrDoc();
    const docA = makeCoreDoc({ now_application_document_xref_guid: "a", final_package_order: 1 });
    const docB = makeCoreDoc({ now_application_document_xref_guid: "b", final_package_order: 2 });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [ntr, docA, docB],
      locked_ntr_guid: "ntr-guid",
      filtered_submission_documents: [],
    };

    const result = getOrderedPermitPackageDocuments(noticeOfWork, {});
    expect(result.map((d) => [d.now_application_document_xref_guid, d.orderLabel])).toEqual([
      ["ntr-guid", "1.1"],
      ["a", "1.2"],
      ["b", "1.3"],
    ]);
  });

  it("interleaves submission documents into the same ordered sequence", () => {
    const docA = makeCoreDoc({ now_application_document_xref_guid: "a", final_package_order: 1 });
    const submissionDoc = { mine_document_guid: "sub-1", is_final_package: true, final_package_order: 2 };
    const docB = makeCoreDoc({ now_application_document_xref_guid: "b", final_package_order: 3 });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [docA, docB],
      filtered_submission_documents: [submissionDoc],
    };

    const result = getOrderedPermitPackageDocuments(noticeOfWork, {});
    // no locked row present, so numbering starts at 1.2
    expect(result.map((d) => d.orderLabel)).toEqual(["1.2", "1.3", "1.4"]);
    expect(result[1].mine_document_guid).toBe("sub-1");
  });

  it("excludes documents not marked as part of the permit package", () => {
    const included = makeCoreDoc({ now_application_document_xref_guid: "in", final_package_order: 1 });
    const excluded = makeCoreDoc({
      now_application_document_xref_guid: "out",
      is_final_package: false,
    });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [included, excluded],
      filtered_submission_documents: [],
    };

    const result = getOrderedPermitPackageDocuments(noticeOfWork, {});
    expect(result.map((d) => d.now_application_document_xref_guid)).toEqual(["in"]);
  });
});

describe("getPermitPackageFilesByType", () => {
  it("returns only core documents matching the requested type, excludes the locked row", () => {
    const ntr = makeNtrDoc();
    const figure = makeCoreDoc({
      now_application_document_xref_guid: "fig-1",
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Site Map",
    });
    const document = makeCoreDoc({
      now_application_document_xref_guid: "doc-1",
      final_package_order: 2,
      permit_package_document_type_code: "DOCUMENT",
      preamble_title: "Application Form",
    });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [ntr, figure, document],
      locked_ntr_guid: "ntr-guid",
      filtered_submission_documents: [],
    };

    const figures = getPermitPackageFilesByType(noticeOfWork, {}, "FIGURE");
    expect(figures).toHaveLength(1);
    expect(figures[0]).toMatchObject({
      now_application_document_xref_guid: "fig-1",
      orderLabel: "1.2",
      preamble_title: "Site Map",
    });

    const documents = getPermitPackageFilesByType(noticeOfWork, {}, "DOCUMENT");
    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({
      now_application_document_xref_guid: "doc-1",
      orderLabel: "1.3",
      preamble_title: "Application Form",
    });
  });

  it("excludes submission documents even if they were somehow tagged with a type code", () => {
    const submissionDoc = {
      mine_document_guid: "sub-1",
      is_final_package: true,
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
    };
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [],
      filtered_submission_documents: [submissionDoc],
    };

    expect(getPermitPackageFilesByType(noticeOfWork, {}, "FIGURE")).toEqual([]);
  });
});
