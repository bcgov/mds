import {
  getNowApplicationDocument,
  getOrderedPermitPackageDocuments,
  getPermitPackageFilesByType,
  getPermitPackageOrderLabel,
  isApplicationCoreDocument,
  isFileReferencedInConditions,
  isIssuedPermitDocument,
  isReviewDocument,
  isSystemGeneratedDocument,
  resolvePermitPackageFileReference,
  shouldShowSystemGeneratedSection,
  splitPermitPackageCoreDocuments,
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
      orderLabel: "1",
      preamble_title: "Site Map",
    });

    const documents = getPermitPackageFilesByType(noticeOfWork, {}, "DOCUMENT");
    expect(documents).toHaveLength(1);
    expect(documents[0]).toMatchObject({
      now_application_document_xref_guid: "doc-1",
      orderLabel: "1.2",
      preamble_title: "Application Form",
    });
  });

  it("numbers Figures and Documents independently even when they share the same final_package_order", () => {
    const figureA = makeCoreDoc({
      now_application_document_xref_guid: "fig-a",
      final_package_order: 0,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Site Map",
    });
    const figureB = makeCoreDoc({
      now_application_document_xref_guid: "fig-b",
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Wildlife Management Plan",
    });
    const documentA = makeCoreDoc({
      now_application_document_xref_guid: "doc-a",
      final_package_order: 0,
      permit_package_document_type_code: "DOCUMENT",
      preamble_title: "Application Form",
    });
    const noticeOfWork = {
      application_type_code: "AMD",
      documents: [figureA, documentA, figureB],
      filtered_submission_documents: [],
    };

    const figures = getPermitPackageFilesByType(noticeOfWork, {}, "FIGURE");
    expect(figures.map((f) => [f.now_application_document_xref_guid, f.orderLabel])).toEqual([
      ["fig-a", "1"],
      ["fig-b", "2"],
    ]);

    const documents = getPermitPackageFilesByType(noticeOfWork, {}, "DOCUMENT");
    // No locked row (application_type_code isn't "NOW"), so Document numbering starts at "1.2",
    // unaffected by there being two Figures ahead of it in insertion order.
    expect(documents.map((d) => [d.now_application_document_xref_guid, d.orderLabel])).toEqual([
      ["doc-a", "1.2"],
    ]);
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

describe("resolvePermitPackageFileReference", () => {
  it("resolves a figure's live index and title", () => {
    const ntr = makeNtrDoc();
    const figure = makeCoreDoc({
      now_application_document_xref_guid: "fig-1",
      final_package_order: 1,
      permit_package_document_type_code: "FIGURE",
      preamble_title: "Site Map",
    });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [ntr, figure],
      locked_ntr_guid: "ntr-guid",
      filtered_submission_documents: [],
    };

    expect(resolvePermitPackageFileReference("fig-1", noticeOfWork, {})).toEqual({
      found: true,
      label: "1 Site Map",
    });
  });

  it("resolves a document's live index and title", () => {
    const document = makeCoreDoc({
      now_application_document_xref_guid: "doc-1",
      final_package_order: 1,
      permit_package_document_type_code: "DOCUMENT",
      preamble_title: "Application Form",
    });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [document],
      filtered_submission_documents: [],
    };

    expect(resolvePermitPackageFileReference("doc-1", noticeOfWork, {})).toEqual({
      found: true,
      label: "1.2 Application Form",
    });
  });

  it("returns found: false for a guid that no longer matches any permit package file", () => {
    const document = makeCoreDoc({
      now_application_document_xref_guid: "doc-1",
      final_package_order: 1,
    });
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [document],
      filtered_submission_documents: [],
    };

    expect(resolvePermitPackageFileReference("deleted-guid", noticeOfWork, {})).toEqual({
      found: false,
    });
  });

  it("does not resolve the locked application-form row itself as a reference", () => {
    const ntr = makeNtrDoc();
    const noticeOfWork = {
      application_type_code: "NOW",
      documents: [ntr],
      locked_ntr_guid: "ntr-guid",
      filtered_submission_documents: [],
    };

    expect(resolvePermitPackageFileReference("ntr-guid", noticeOfWork, {})).toEqual({
      found: false,
    });
  });
});

describe("isFileReferencedInConditions", () => {
  const conditionReferencing = (guid: string, overrides = {}) => ({
    condition: `See {permit_package_file:${guid}} for details.`,
    sub_conditions: [],
    ...overrides,
  });

  it("returns true when a top-level condition references the guid", () => {
    const conditions = [conditionReferencing("file-guid-1")];
    expect(isFileReferencedInConditions(conditions as any, "file-guid-1")).toBe(true);
  });

  it("returns true when only a nested sub-condition references the guid", () => {
    const conditions = [
      {
        condition: "No reference in this top-level condition.",
        sub_conditions: [conditionReferencing("file-guid-1")],
      },
    ];
    expect(isFileReferencedInConditions(conditions as any, "file-guid-1")).toBe(true);
  });

  it("returns false when no condition references the guid", () => {
    const conditions = [conditionReferencing("some-other-guid")];
    expect(isFileReferencedInConditions(conditions as any, "file-guid-1")).toBe(false);
  });

  it("returns false for an empty conditions list", () => {
    expect(isFileReferencedInConditions([], "file-guid-1")).toBe(false);
  });

  it("returns false when conditions is undefined", () => {
    expect(isFileReferencedInConditions(undefined as any, "file-guid-1")).toBe(false);
  });

  it("does not false-positive when the guid is only a prefix of the referenced guid", () => {
    const conditions = [conditionReferencing("file-guid-1-extra")];
    expect(isFileReferencedInConditions(conditions as any, "file-guid-1")).toBe(false);
  });

  it("ignores plain {variable} tokens that aren't permit package file references", () => {
    const conditions = [{ condition: "{mine_name} has no file reference.", sub_conditions: [] }];
    expect(isFileReferencedInConditions(conditions as any, "file-guid-1")).toBe(false);
  });
});

const makeSectionDoc = (
  xrefGuid: string,
  subTypeCode: string | null,
  typeCode: string,
  documentName = "file.pdf"
) => ({
  now_application_document_xref_guid: xrefGuid,
  now_application_document_sub_type_code: subTypeCode,
  now_application_document_type_code: typeCode,
  mine_document: { mine_document_guid: `mine-${xrefGuid}`, document_name: documentName },
});

const sectionGuids = (docs) => docs.map((doc) => doc.now_application_document_xref_guid);

describe("shouldShowSystemGeneratedSection", () => {
  it("is always true for Notice of Work applications", () => {
    expect(
      shouldShowSystemGeneratedSection(
        { application_type_code: "NOW", documents: [] },
        { has_permit_conditions: false }
      )
    ).toBe(true);
  });

  it("follows the permit conditions flow for other applications", () => {
    const amendment = { application_type_code: "ADA", documents: [] };
    expect(shouldShowSystemGeneratedSection(amendment, { has_permit_conditions: true })).toBe(true);
    expect(shouldShowSystemGeneratedSection(amendment, { has_permit_conditions: false })).toBe(
      false
    );
  });

  it("assumes the permit conditions flow when there is no draft permit amendment", () => {
    const amendment = { application_type_code: "ADA", documents: [] };
    expect(shouldShowSystemGeneratedSection(amendment, null)).toBe(true);
    expect(shouldShowSystemGeneratedSection(amendment, {})).toBe(true);
  });
});

describe("splitPermitPackageCoreDocuments", () => {
  const documents = [
    makeSectionDoc("annual-summary", "AAF", "ANS"),
    makeSectionDoc("location-map", "MDO", "LMA"),
    makeSectionDoc("bond-calculator", "SDO", "SCD"),
    makeSectionDoc("status-report", "GDO", "SRE"),
    makeSectionDoc("ntr", "AEF", "NTR", "form.pdf"),
    makeSectionDoc("draft-permit", "AEF", "PMT", "DRAFT-permit.pdf"),
    makeSectionDoc("issued-permit", "AEF", "PMT", "permit.pdf"),
    makeSectionDoc("referral", "RDO", "BRR"),
    makeSectionDoc("consultation", "CDO", "CRS"),
    makeSectionDoc("public-comment", "PDO", "PCC"),
    makeSectionDoc("uncategorised", null, "XXX"),
  ];

  it("puts each document into exactly one section when the System-generated section is shown", () => {
    const sections = splitPermitPackageCoreDocuments(documents, true);

    expect(sectionGuids(sections.application)).toEqual([
      "annual-summary",
      "location-map",
      "bond-calculator",
    ]);
    expect(sectionGuids(sections.systemGenerated)).toEqual(["ntr", "draft-permit"]);
    expect(sectionGuids(sections.government)).toEqual(["status-report", "uncategorised"]);
    expect(sectionGuids(sections.excludedFromSections)).toEqual([
      "issued-permit",
      "referral",
      "consultation",
      "public-comment",
    ]);

    const allGuids = [
      ...sections.application,
      ...sections.systemGenerated,
      ...sections.government,
      ...sections.excludedFromSections,
    ].map((doc) => doc.now_application_document_xref_guid);
    expect(allGuids).toHaveLength(documents.length);
    expect(new Set(allGuids).size).toBe(documents.length);
  });
});
