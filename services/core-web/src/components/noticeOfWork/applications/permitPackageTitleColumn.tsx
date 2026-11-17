import React from "react";
import moment from "moment-timezone";
import { DatePicker, Input, Select } from "antd";
import { ColumnType } from "antd/lib/table";
import { INoWApplicationForm, IOption } from "@mds/common/interfaces";

export const PERMIT_PACKAGE_DOCUMENT_TYPE_OPTIONS: IOption[] = [
  { value: "DOCUMENT", label: "Document" },
  { value: "FIGURE", label: "Figure" },
];

// The two kinds of file a permit package can hold, as they come from the notice of work
export type INoWCoreDocument = INoWApplicationForm["documents"][number];
export type INoWSubmissionDocument = INoWApplicationForm["filtered_submission_documents"][number];

// A row in the package modal tables, which build rows from either kind of document
export interface IPermitPackageRow {
  key: string;
  mine_document_version_guid?: string;
  preamble_title?: string;
  permit_package_document_type_code?: PermitPackageDocumentType;
  [field: string]: unknown;
}

export const DEFAULT_PERMIT_PACKAGE_DOCUMENT_TYPE = "DOCUMENT";

export type PermitPackageDocumentType = "FIGURE" | "DOCUMENT";

export interface IPermitPackageDetails {
  type?: PermitPackageDocumentType;
  author?: string;
  date?: string | null;
}

export interface IPermitPackageTitles {
  titles: { [key: string]: string };
  onTitleChange?: (key: string, value: string) => void;
  // Type, author and date per row key. Optional, so the title column works on its own.
  details?: { [key: string]: IPermitPackageDetails };
  onDetailChange?: (
    key: string,
    field: keyof IPermitPackageDetails,
    value: IPermitPackageDetails[keyof IPermitPackageDetails]
  ) => void;
  // Only true when the permit package type selector feature flag is on
  showTypeSelector?: boolean;
  expandedKeys?: string[];
  onExpandedKeysChange?: (keys: string[]) => void;
  // Row to highlight after a failed save attempt
  highlightKey?: string | null;
}

const HIGHLIGHT_STYLE = { boxShadow: "0 0 0 3px rgba(255, 77, 79, 0.45)" };

const isEditableRow = (
  record,
  selectedKeys: string[],
  lockedRowKeys: string[],
  packageTitles?: IPermitPackageTitles
) =>
  selectedKeys.includes(record.key) &&
  !lockedRowKeys.includes(record.key) &&
  !!packageTitles?.onTitleChange;

// Title column for the Create Final Application Package modal.
// Selected rows get an input, as a title is required for permit package documents.
export const renderPermitPackageTitleColumn = ({
  selectedKeys = [],
  lockedRowKeys = [],
  packageTitles,
}: {
  selectedKeys?: string[];
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles;
}): ColumnType<IPermitPackageRow> => {
  return {
    title: "Title",
    key: "package_title",
    render: (text: string, record) => {
      const title = packageTitles?.titles?.[record.key] ?? record.preamble_title ?? "";

      if (!isEditableRow(record, selectedKeys, lockedRowKeys, packageTitles)) {
        return <div title="Title">{title}</div>;
      }

      return (
        <div title="Title">
          <Input
            id={`${record.key}_package_title`}
            aria-label="Title"
            placeholder="Title (required)"
            value={title}
            status={!title.trim() ? "error" : undefined}
            style={packageTitles.highlightKey === record.key ? HIGHLIGHT_STYLE : undefined}
            onChange={(e) => packageTitles.onTitleChange(record.key, e.target.value)}
          />
        </div>
      );
    },
  };
};

export const allSelectedHaveTitles = (
  selectedKeys: string[] = [],
  lockedRowKeys: string[] = [],
  titles: { [key: string]: string } = {}
): boolean => {
  return selectedKeys
    .filter((key) => !lockedRowKeys.includes(key) && key in titles)
    .every((key) => !!titles[key]?.trim());
};

// Type column (Document or Figure), shown only when the permit package type selector feature flag is on.
export const renderPermitPackageTypeColumn = ({
  selectedKeys = [],
  lockedRowKeys = [],
  packageTitles,
}: {
  selectedKeys?: string[];
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles;
}): ColumnType<IPermitPackageRow> => ({
  title: "Type",
  key: "package_type",
  width: 140,
  render: (text: string, record) => {
    const type =
      packageTitles?.details?.[record.key]?.type ??
      record.permit_package_document_type_code ??
      DEFAULT_PERMIT_PACKAGE_DOCUMENT_TYPE;
    const label = PERMIT_PACKAGE_DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

    if (
      !isEditableRow(record, selectedKeys, lockedRowKeys, packageTitles) ||
      !packageTitles?.onDetailChange
    ) {
      return <div title="Type">{selectedKeys.includes(record.key) ? label : ""}</div>;
    }

    return (
      <div title="Type">
        <Select
          id={`${record.key}_package_type`}
          aria-label="Type"
          style={{ width: "100%" }}
          value={type}
          options={PERMIT_PACKAGE_DOCUMENT_TYPE_OPTIONS}
          onChange={(value) => packageTitles.onDetailChange(record.key, "type", value)}
        />
      </div>
    );
  },
});

// The expandable row holds the optional Author and Date fields.
export const getPermitPackageExpandProps = ({
  selectedKeys = [],
  lockedRowKeys = [],
  packageTitles,
}: {
  selectedKeys?: string[];
  lockedRowKeys?: string[];
  packageTitles?: IPermitPackageTitles;
}) => {
  if (!packageTitles?.onDetailChange) {
    return null;
  }
  return {
    rowExpandable: (record) => isEditableRow(record, selectedKeys, lockedRowKeys, packageTitles),
    // Rows contain inputs, so only the expand icon toggles them
    expandRowByClick: false,
    expandedRowKeys: packageTitles.expandedKeys ?? [],
    onExpandedRowsChange: (keys) => packageTitles.onExpandedKeysChange?.(keys.map(String)),
    expandedRowRender: (record) => {
      const details = packageTitles.details?.[record.key] ?? {};
      return (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <label style={{ flex: "1 1 240px" }}>
            Author (optional)
            <Input
              id={`${record.key}_package_author`}
              aria-label="Author"
              placeholder="Author"
              value={details.author ?? ""}
              onChange={(e) => packageTitles.onDetailChange(record.key, "author", e.target.value)}
            />
          </label>
          <label style={{ flex: "1 1 240px" }}>
            Date (optional)
            <DatePicker
              id={`${record.key}_package_date`}
              aria-label="Date"
              style={{ width: "100%" }}
              format="YYYY-MM-DD"
              value={details.date ? moment(details.date) : null}
              onChange={(date) =>
                packageTitles.onDetailChange(
                  record.key,
                  "date",
                  date ? date.format("YYYY-MM-DD") : null
                )
              }
            />
          </label>
        </div>
      );
    },
  };
};

// "Author ✓ Date ✓" shown next to the file name while the row is collapsed.
export const renderPermitPackageDetailsSummary = (
  record,
  selectedKeys: string[] = [],
  packageTitles?: IPermitPackageTitles
) => {
  if (!packageTitles?.onDetailChange || !selectedKeys.includes(record.key)) {
    return null;
  }
  if (packageTitles.expandedKeys?.includes(record.key)) {
    return null;
  }
  const details = packageTitles.details?.[record.key] ?? {};
  const parts = [details.author?.trim() && "Author ✓", details.date && "Date ✓"].filter(Boolean);
  return parts.length ? (
    <span className="padding-sm--left" style={{ opacity: 0.65, fontSize: 12 }}>
      {parts.join(" ")}
    </span>
  ) : null;
};

export const getMissingTitleKeys = (
  selectedKeys: string[] = [],
  lockedRowKeys: string[] = [],
  titles: { [key: string]: string } = {}
): string[] =>
  selectedKeys.filter(
    (key) => !lockedRowKeys.includes(key) && key in titles && !titles[key]?.trim()
  );
