import { getLockedSystemNtrDoc } from "@mds/common/utils/helpers";
import { parseConditionText } from "@mds/common/utils/conditionTokenParser";
import { IPermitCondition } from "@mds/common/interfaces";

export interface PermitPackageDocumentRow {
  now_application_document_type_code?: string | null;
  now_application_document_xref_guid?: string;
  final_package_order?: number | null;
  is_final_package?: boolean;
  is_referral_package?: boolean;
  is_consultation_package?: boolean;
  is_system_generated?: boolean;
  deleted_ind?: boolean;
  create_timestamp?: string;
  preamble_title?: string;
  preamble_author?: string;
  preamble_date?: string | null;
  category?: string;
  description?: string;
  permit_package_document_type_code?: "FIGURE" | "DOCUMENT";
  isLockedApplicationForm?: boolean;
  mine_document?: {
    mine_document_guid?: string | null;
    document_manager_guid?: string | null;
    document_name?: string | null;
    upload_date?: string | null;
  };
}

export interface PermitPackageNoticeOfWork {
  application_type_code?: string;
  documents: PermitPackageDocumentRow[];
  filtered_submission_documents?: PermitPackageDocumentRow[];
  locked_ntr_guid?: string | null;
}

export interface PermitPackageNowProgress {
  REV?: { end_date?: string | null };
}

const TECHNICAL_REVIEW_NTR_DESCRIPTION =
  "This document was automatically created when Technical Review was completed.";

const LOCKED_ROW_BASE = {
  isLockedApplicationForm: true,
  now_application_document_type_code: null,
  is_final_package: true,
  is_referral_package: false,
  is_consultation_package: false,
};

const NA_ROW = {
  ...LOCKED_ROW_BASE,
  final_package_order: -1,
  now_application_document_xref_guid: "application-form-1.1", // synthetic key — no real NTR doc exists yet
  preamble_title: "N/A",
  preamble_author: "N/A",
  preamble_date: null,
  category: "N/A",
  description: "N/A",
  mine_document: {
    mine_document_guid: null,
    document_manager_guid: null,
    document_name: null,
    upload_date: null,
  },
};

/**
 * Determines the locked, system-generated "1.1" Notice of Work Application row for the permit package, if one applies for this application.
 * This is the single source of truth for that determination - NOWDocuments.js, FinalPermitDocuments.js, and the Condition Data Variable
 * picker all resolve it from here so behaviour can't drift between them.
 */
export const getNowApplicationDocument = (
  noticeOfWork: PermitPackageNoticeOfWork,
  progress: PermitPackageNowProgress
) => {
  const nullResult = { nowApplicationDocument: null, lockedNtrGuid: null };

  if (noticeOfWork.application_type_code !== "NOW") {
    return nullResult;
  }

  const hasSystemGeneratedNtr = (noticeOfWork.documents || []).some(
    (doc) => doc.now_application_document_type_code === "NTR" && doc.is_system_generated
  );
  if (!hasSystemGeneratedNtr) {
    return nullResult;
  }

  const technicalReviewEverCompleted =
    !!progress?.REV?.end_date ||
    (noticeOfWork.documents || []).some(
      (doc) =>
        doc.now_application_document_type_code === "NTR" &&
        doc.is_system_generated &&
        doc.description === TECHNICAL_REVIEW_NTR_DESCRIPTION
    );
  if (!technicalReviewEverCompleted) {
    return nullResult;
  }

  const latestNtr = getLockedSystemNtrDoc(noticeOfWork.documents, noticeOfWork.locked_ntr_guid);
  if (!latestNtr) {
    return { nowApplicationDocument: NA_ROW, lockedNtrGuid: null };
  }

  return {
    lockedNtrGuid: latestNtr.now_application_document_xref_guid,
    nowApplicationDocument: {
      ...latestNtr,
      ...LOCKED_ROW_BASE,
      preamble_title: latestNtr.preamble_title || "Notice of Work Application",
      preamble_author: latestNtr.preamble_author || "N/A",
      preamble_date: latestNtr.preamble_date ?? latestNtr.mine_document?.upload_date ?? null,
      category: "Notice of Work Form",
      description:
        "Latest version of the Notice of Work application. Always included and system-managed.",
    },
  };
};

/**
 * Sorts permit package documents into display order: the locked row (if any) always first, then by final_package_order.
 * Shared by the permit package document table and the Condition Data Variable picker so their orderings can't drift apart.
 */
export const comparePermitPackageDocuments = (
  a: PermitPackageDocumentRow,
  b: PermitPackageDocumentRow
): number => {
  if (a.isLockedApplicationForm && b.isLockedApplicationForm) return 0;
  if (a.isLockedApplicationForm) return -1;
  if (b.isLockedApplicationForm) return 1;
  return (a.final_package_order ?? 0) - (b.final_package_order ?? 0);
};

/**
 * The "1.N" order label shown for a permit package document, matching the numbering rendered in NOWDocuments.js's sortable "Order" column.
 * The locked row (when present) always occupies "1.1"; when it's absent, numbering still starts at "1.2" to preserve that reserved slot.
 */
export const getPermitPackageOrderLabel = (
  index: number,
  hasLockedRow: boolean,
  isLocked: boolean
): string => (isLocked ? "1.1" : `1.${index + (hasLockedRow ? 1 : 2)}`);

/**
 * Returns every document that is part of the permit package in the same order shown in the permit package document table, each annotated with its display order label (e.g. "1.2").
 * This is the source of truth for permit package ordering — NOWDocuments.js, FinalPermitDocuments.js, and the Condition Data Variable picker all resolve labels from here.
 * This ensures the numbering can never drift between the document table and an inserted CDV reference.
 */
export const getOrderedPermitPackageDocuments = (
  noticeOfWork: PermitPackageNoticeOfWork,
  progress: PermitPackageNowProgress
) => {
  const { nowApplicationDocument, lockedNtrGuid } = getNowApplicationDocument(
    noticeOfWork,
    progress
  );

  const permitDocuments = (noticeOfWork.documents || []).filter(
    (doc) =>
      doc.is_final_package &&
      (!lockedNtrGuid || doc.now_application_document_xref_guid !== lockedNtrGuid)
  );

  const permitSubmissionDocuments = (noticeOfWork.filtered_submission_documents || []).filter(
    (doc) => doc.is_final_package
  );

  const combined = [
    ...(nowApplicationDocument ? [nowApplicationDocument] : []),
    ...permitDocuments,
    ...permitSubmissionDocuments,
  ];

  const sorted = [...combined].sort(comparePermitPackageDocuments);

  const hasLockedRow = sorted.some((doc) => doc.isLockedApplicationForm);

  return sorted.map((doc, index) => ({
    ...doc,
    orderLabel: getPermitPackageOrderLabel(index, hasLockedRow, !!doc.isLockedApplicationForm),
  }));
};

/**
 * The core-uploaded (non-submission) permit package documents tagged as the given Figure/Document type, each with its live display order label.
 * This is the data source for the Condition Data Variable picker's "Permit Package Files" menu.
 */
export const getPermitPackageFilesByType = (
  noticeOfWork: PermitPackageNoticeOfWork,
  progress: PermitPackageNowProgress,
  permitPackageDocumentTypeCode: "FIGURE" | "DOCUMENT"
) =>
  getOrderedPermitPackageDocuments(noticeOfWork, progress).filter(
    (doc) =>
      !doc.isLockedApplicationForm &&
      doc.permit_package_document_type_code === permitPackageDocumentTypeCode &&
      doc.now_application_document_xref_guid
  );

/**
 * True if any condition (including nested sub-conditions) contains a live {permit_package_file:<guid>} reference to this file.
 * Used to warn before removing a file from the permit package or deleting it, so a broken reference isn't created silently.
 */
export const isFileReferencedInConditions = (
  conditions: IPermitCondition[],
  guid: string
): boolean =>
  (conditions || []).some((condition) => {
    const referencedHere = parseConditionText(condition.condition || "").some(
      (token) => token.type === "permitPackageFile" && token.guid === guid
    );
    return referencedHere || isFileReferencedInConditions(condition.sub_conditions, guid);
  });

export interface PermitPackageFileReference {
  found: boolean;
  label?: string;
}

/**
 * Resolves a permit package file's live "1.N Title" label from its xref guid, by guid, across both Figures and Documents.
 * Used by the Condition Data Variable picker's read view to render an inserted reference's current index/title.
 * Returns `found: false` when the guid no longer attaches any permit package file (e.g. it was soft-deleted or removed from the package).
 */
export const resolvePermitPackageFileReference = (
  // CRITICAL: This guid must stay attached to the same xref row for as long as any condition might reference it.
  // See the comment in now_application_document_xref.py for more details - if this is broken, the reference will be too. 
  guid: string,
  noticeOfWork: PermitPackageNoticeOfWork,
  progress: PermitPackageNowProgress
): PermitPackageFileReference => {
  const match = getOrderedPermitPackageDocuments(noticeOfWork, progress).find(
    (doc) => !doc.isLockedApplicationForm && doc.now_application_document_xref_guid === guid
  );

  if (!match) {
    return { found: false };
  }

  return { found: true, label: `${match.orderLabel} ${match.preamble_title}` };
};
