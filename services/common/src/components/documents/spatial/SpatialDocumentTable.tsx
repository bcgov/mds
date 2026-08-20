import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { GenericDocTableProps } from "@mds/common/interfaces/document/documentTableProps.interface";
import CoreTable from "../../common/CoreTable";
import { uploadDateColumn, uploadedByColumn } from "../DocumentColumns";
import {
  ITableAction,
  renderActionsColumn,
  renderTaggedColumn,
} from "../../common/CoreTableCommonColumns";
import { openModal } from "@mds/common/redux/actions/modalActions";
import ViewSpatialDetailModal from "./ViewSpatialDetailModal";
import DocumentCompression from "../DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";
import {
  groupSpatialBundles,
  updateSpatialBundlePurposes,
} from "@mds/common/redux/slices/spatialDataSlice";
import { downloadFileFromDocumentManager } from "@mds/common/redux/utils/actionlessNetworkCalls";
import {
  ISpatialBundle,
  ISpatialBundlePurposeCode,
} from "@mds/common/interfaces/document/spatialBundle.interface";
import { IMineDocument } from "@mds/common/interfaces";
import { getFormattedUserName } from "@mds/common/redux/selectors/authenticationSelectors";
import moment from "moment";
import SpatialValidationDetailsDrawer from "./SpatialValidationDetailsDrawer";

/**
 * Asks the table to reveal the bundle holding a particular document. `requestId` is what
 * triggers the reveal, so repeat clicks on the same file still work.
 */
export interface ISpatialFocusRequest {
  requestId: number;
  mineDocumentGuid?: string;
  documentManagerGuid?: string;
  bundleId?: string | number;
}

export interface SpatialDocumentTableProps extends GenericDocTableProps<ISpatialBundle> {
  documents: IMineDocument[];
  categoryText?: string;
  /** When provided, use server-side bundles instead of client grouping alone */
  spatialBundles?: ISpatialBundle[];
  showValidation?: boolean;
  showType?: boolean;
  purposeCodes?: ISpatialBundlePurposeCode[];
  canEditPurposes?: boolean;
  showPreviewShape?: boolean;
  showDetails?: boolean;
  description?: string;
  emptyText?: string;
  /** Hide legacy upload date / created by columns (NoW spatial section) */
  compactColumns?: boolean;
  /** Renders a tinted panel header band with this title above the table */
  title?: string;
  /** Shows an "N detected" count badge in the panel header */
  showCountBadge?: boolean;
  /** Makes the titled panel header toggle the table; starts collapsed */
  collapsible?: boolean;
  /** Reveals and briefly highlights the bundle holding a document linked from another table */
  focusRequest?: ISpatialFocusRequest | null;
}

const VALIDATION_TAG_COLOR: Record<string, string> = {
  VALID: "success",
  INVALID: "error",
  UNABLE_TO_VALIDATE: "warning",
};

const VALIDATION_TAG_ICON: Record<string, React.ReactNode> = {
  VALID: <CheckCircleOutlined />,
  INVALID: <CloseCircleOutlined />,
  UNABLE_TO_VALIDATE: <ExclamationCircleOutlined />,
};

const VALIDATION_LABEL: Record<string, string> = {
  VALID: "Valid",
  INVALID: "Failed",
  UNABLE_TO_VALIDATE: "Unable to validate",
};

// The expand icon is absolutely positioned inside a 25px cell, so the name needs its own gutter.
const NAME_COLUMN_INDENT = 8;

const HIGHLIGHT_DURATION_MS = 3000;
const HIGHLIGHT_STYLE = { backgroundColor: "#FFF7E6", transition: "background-color 0.4s" };

// The tag only has room for the headline; the Details drawer carries the full explanation.
const summarizeError = (error: string) => {
  const firstSentence = error.match(/^[^.]*\./);
  return firstSentence ? firstSentence[0] : error;
};

const isSingleFileName = (name?: string) => {
  const lower = (name || "").toLowerCase();
  return lower.endsWith(".kml") || lower.endsWith(".kmz");
};

const fileExtension = (fileName?: string) => {
  const parts = (fileName || "").split(".");
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : null;
};

// Builds a table row directly from a server-side bundle so validated bundles render even
// when no matching client-side document row exists (e.g. an INVALID bundle with no geomark).
const bundleToRow = (bundle: ISpatialBundle) => {
  const name = bundle.name || bundle.document_name || "";
  const bundleFiles = (bundle.bundle_documents || []).map((doc) => ({
    ...doc,
    key: doc.document_manager_guid || doc.mine_document_guid,
    geomark_id: bundle.geomark_id,
  }));
  return {
    ...bundle,
    key: `bundle-${bundle.bundle_id}`,
    bundle_id: bundle.bundle_id,
    document_name: name,
    name,
    bundleFiles,
    bundleSize: bundleFiles.length,
    isParent: true,
    isSingleFile: isSingleFileName(name) || bundleFiles.length <= 1,
    upload_date: bundleFiles[0]?.upload_date,
    create_user: bundleFiles[0]?.create_user,
    purpose_codes: bundle.purpose_codes || [],
  };
};

const SpatialDocumentTable: FC<SpatialDocumentTableProps> = ({
  documents,
  categoryText,
  spatialBundles: spatialBundlesProp,
  showValidation = false,
  showType = false,
  purposeCodes = [],
  canEditPurposes = false,
  showPreviewShape = false,
  showDetails = false,
  description,
  emptyText,
  compactColumns = false,
  title,
  showCountBadge = false,
  collapsible = false,
  focusRequest = null,
}) => {
  const dispatch = useDispatch();
  const [isCompressionModalVisible, setIsCompressionModalVisible] = useState(false);
  const [compressionFiles, setCompressionFiles] = useState<IMineDocument[] | null>(null);
  const [spatialBundles, setSpatialBundles] = useState<any[]>([]);
  const [detailsBundle, setDetailsBundle] = useState<ISpatialBundle | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsible);
  const [highlightKey, setHighlightKey] = useState<string | number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedRequestRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const username = useSelector(getFormattedUserName);

  const enrichFromPropBundles = (grouped: any[]) => {
    if (!spatialBundlesProp?.length) {
      return grouped;
    }
    const matched = new Set<ISpatialBundle>();
    const enriched = grouped.map((row) => {
      const match = spatialBundlesProp.find(
        (b) =>
          String(b.bundle_id) === String(row.bundle_id) ||
          b.name === row.document_name ||
          b.document_name === row.document_name
      );
      if (!match) {
        return row;
      }
      matched.add(match);
      return {
        ...row,
        ...match,
        document_name: row.document_name || match.name || match.document_name,
        geomark_id: match.geomark_id || row.geomark_id,
        validation_status: match.validation_status,
        validation_error: match.validation_error,
        validation_checks: match.validation_checks,
        purpose_codes: match.purpose_codes || [],
        bundle_id: match.bundle_id ?? row.bundle_id,
        bundleFiles: row.bundleFiles,
        isParent: row.isParent,
        isSingleFile: row.isSingleFile,
        key: row.key,
      };
    });
    const unmatched = spatialBundlesProp.filter((b) => !matched.has(b)).map(bundleToRow);
    return [...enriched, ...unmatched];
  };

  const handleGetSpatialBundles = async () => {
    const docs = documents.map((doc) => {
      if (doc.mine_document_guid) {
        return doc;
      }
      return {
        ...doc,
        upload_date: doc.upload_date ?? moment().toISOString(),
        create_user: doc.create_user ?? username,
      };
    });

    const newSpatialBundles = enrichFromPropBundles(groupSpatialBundles(docs));
    setSpatialBundles(newSpatialBundles);
  };

  useEffect(() => {
    if (documents) {
      handleGetSpatialBundles();
    }
  }, [documents, spatialBundlesProp]);

  const findFocusedRow = (request: ISpatialFocusRequest) =>
    spatialBundles.find((row) =>
      (row.bundleFiles || []).some(
        (file) =>
          (request.documentManagerGuid &&
            file.document_manager_guid === request.documentManagerGuid) ||
          (request.mineDocumentGuid && file.mine_document_guid === request.mineDocumentGuid)
      )
    ) ??
    spatialBundles.find(
      (row) =>
        request.bundleId !== undefined &&
        row.bundle_id !== undefined &&
        String(row.bundle_id) === String(request.bundleId)
    );

  useEffect(() => {
    if (!focusRequest?.requestId) {
      return;
    }
    setIsExpanded(true);
    containerRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [focusRequest?.requestId]);

  // The bundles load asynchronously, so the row to highlight may only show up after the request.
  // The timer lives in a ref rather than in the effect cleanup so a later bundle update (a
  // purpose toggle, say) cannot leave the highlight on forever.
  useEffect(() => {
    if (!focusRequest?.requestId || highlightedRequestRef.current === focusRequest.requestId) {
      return;
    }
    const focusedRow = findFocusedRow(focusRequest);
    if (!focusedRow) {
      return;
    }
    highlightedRequestRef.current = focusRequest.requestId;
    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }
    setHighlightKey(focusedRow.key);
    highlightTimerRef.current = setTimeout(() => setHighlightKey(null), HIGHLIGHT_DURATION_MS);
  }, [focusRequest?.requestId, spatialBundles]);

  useEffect(
    () => () => {
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
      }
    },
    []
  );

  // Bundles returned by the API carry no mine_guid; compression needs one to resolve the files.
  const fallbackMineGuid = documents.find((doc) => doc.mine_guid)?.mine_guid;
  const mineDocuments = (compressionFiles ?? documents).map(
    (doc) => new MineDocument({ ...doc, mine_guid: doc.mine_guid ?? fallbackMineGuid })
  );
  const siblingBundleIds = useMemo(
    () => spatialBundles.map((b) => b.bundle_id).filter(Boolean),
    [spatialBundles]
  );

  const downloadSpatialBundle = (_, record) => {
    setCompressionFiles(record?.bundleFiles?.length ? record.bundleFiles : null);
    setIsCompressionModalVisible(true);
  };

  const downloadSingleFile = (_, record) => {
    const file = record?.document_manager_guid ? record : record?.bundleFiles?.[0];
    if (!file?.document_manager_guid) {
      return;
    }
    downloadFileFromDocumentManager(file);
  };

  const downloadBundle = (record: any) => {
    if (!record) {
      return;
    }
    if (record.isSingleFile || (record.bundleFiles || []).length <= 1) {
      downloadSingleFile(null, record);
      return;
    }
    downloadSpatialBundle(null, record);
  };

  const viewSpatialBundle = (_, record) => {
    const spatialDocuments = (record.bundleFiles || []).map((f) => ({
      ...f,
      geomark_id: record.geomark_id || f.geomark_id,
    }));
    dispatch(
      openModal({
        props: {
          title: "View Spatial Data",
          spatialDocuments,
        },
        content: ViewSpatialDetailModal,
      })
    );
  };

  const previewShape = (_, record) => {
    if (record.validation_status && record.validation_status !== "VALID") {
      return;
    }
    viewSpatialBundle(_, record);
  };

  const openDetails = (_, record) => {
    setDetailsBundle(record);
    setDetailsOpen(true);
  };

  const togglePurpose = async (record: any, purposeCode: string, checked: boolean) => {
    if (!canEditPurposes || !record.bundle_id) {
      return;
    }
    const current = new Set(record.purpose_codes || []);
    if (checked) {
      current.add(purposeCode);
    } else {
      current.delete(purposeCode);
    }
    await dispatch(
      updateSpatialBundlePurposes({
        bundle_id: record.bundle_id,
        purpose_codes: Array.from(current),
        sibling_bundle_ids: siblingBundleIds,
      }) as any
    );
    setSpatialBundles((prev) =>
      prev.map((b) =>
        String(b.bundle_id) === String(record.bundle_id)
          ? { ...b, purpose_codes: Array.from(current) }
          : b
      )
    );
  };

  const getBundleType = (record: any) => {
    if (record.isSingleFile) {
      const name = record.document_name || record.bundleFiles?.[0]?.document_name || "";
      if (name.toLowerCase().endsWith(".kmz")) return "KMZ";
      if (name.toLowerCase().endsWith(".kml")) return "KML";
      return "Spatial File";
    }
    return "Shapefile Bundle";
  };

  const recordActionsFilter = (record, allActions) => {
    if (!record.isParent) {
      return [];
    }
    let actions = allActions;
    if (record.isSingleFile) {
      actions = actions.filter((a) => a.key !== "download-all");
    } else {
      actions = actions.filter((a) => a.key !== "download");
    }
    if (showPreviewShape) {
      actions = actions.filter((a) => a.key !== "view-detail");
      if (record.validation_status !== "VALID") {
        actions = actions.filter((a) => a.key !== "preview-shape");
      }
    }
    return actions;
  };

  const actions: ITableAction[] = [
    {
      key: "download",
      label: "Download",
      clickFunction: downloadSingleFile,
    },
    { key: "download-all", label: "Download All", clickFunction: downloadSpatialBundle },
    {
      key: "view-detail",
      label: "View Details",
      clickFunction: viewSpatialBundle,
    },
  ];

  if (showPreviewShape) {
    actions.push({
      key: "preview-shape",
      label: "Preview Shape",
      clickFunction: previewShape,
    });
  }
  if (showDetails) {
    actions.push({
      key: "details",
      label: "Details",
      clickFunction: openDetails,
    });
  }

  const categoryColumn = categoryText
    ? [
      {
        key: "category",
        title: "Category",
        render: () => <div title="Category">{categoryText}</div>,
      },
    ]
    : [];

  const typeColumn = showType
    ? [
      {
        key: "type",
        title: "Type",
        render: (_text, record) => (record.isParent ? getBundleType(record) : null),
      },
    ]
    : [];

  const purposeColumn =
    purposeCodes?.length > 0
      ? [
        {
          key: "purposes",
          title: purposeCodes.length === 1 ? purposeCodes[0].description : "Purpose",
          render: (_text, record) => {
            if (!record.isParent) {
              return null;
            }
            return (
              <div>
                {purposeCodes.map((purpose) => {
                  const checked = (record.purpose_codes || []).includes(
                    purpose.spatial_bundle_purpose_code
                  );
                  return (
                    <Checkbox
                      key={purpose.spatial_bundle_purpose_code}
                      checked={checked}
                      disabled={!canEditPurposes}
                      onChange={(e) =>
                        togglePurpose(
                          record,
                          purpose.spatial_bundle_purpose_code,
                          e.target.checked
                        )
                      }
                    >
                      {purpose.description}
                    </Checkbox>
                  );
                })}
              </div>
            );
          },
        },
      ]
      : [];

  const validationColumn = showValidation
    ? [
      {
        key: "validation",
        title: "Validation",
        render: (_text, record) => {
          if (!record.isParent) {
            return null;
          }
          const status = record.validation_status;
          const label = VALIDATION_LABEL[status] || status;

          if (!label) {
            return null;
          }
          const reason =
            status === "INVALID" && record.validation_error
              ? ` — ${summarizeError(record.validation_error)}`
              : status === "UNABLE_TO_VALIDATE" &&
                record.validation_checks?.missing_extensions?.length
                ? ` — missing ${record.validation_checks.missing_extensions.join(", ")}`
                : "";
          return (
            <Tag color={VALIDATION_TAG_COLOR[status]} icon={VALIDATION_TAG_ICON[status]}>
              {`${label}${reason}`}
            </Tag>
          );
        },
      },
    ]
    : [];

  const nameColumn = showValidation
    ? {
      key: "spatial_file",
      title: "Spatial File",
      render: (_text, record) => {
        if (!record.isParent) {
          return <div style={{ paddingLeft: NAME_COLUMN_INDENT }}>{record.document_name}</div>;
        }
        const prefix = record.isSingleFile ? "Single file" : "Shapefile bundle";
        const extensions = (record.bundleFiles || [])
          .map((f) => fileExtension(f.document_name))
          .filter(Boolean);
        const missing = (record.validation_checks?.missing_extensions || []).map((ext) =>
          ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`
        );
        const caption = extensions.length
          ? `${prefix} · ${extensions.join(" ")}${missing.length ? ` (missing ${missing.join(" ")})` : ""
          }`
          : "";
        return (
          <div style={{ paddingLeft: NAME_COLUMN_INDENT }}>
            <div>{record.document_name || record.name}</div>
            {caption && (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {caption}
              </Typography.Text>
            )}
          </div>
        );
      },
    }
    : renderTaggedColumn("document_name", "bundleSize", "File Name");

  const columns = [
    nameColumn,
    ...categoryColumn,
    ...typeColumn,
    ...purposeColumn,
    ...validationColumn,
    ...(compactColumns
      ? []
      : [
        uploadDateColumn("upload_date", "Last Modified"),
        uploadedByColumn("create_user", "Created By"),
      ]),
    renderActionsColumn({
      actions,
      recordActionsFilter,
    }),
  ];

  const body = (
    <>
      {description && <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>}
      <DocumentCompression
        mineDocuments={mineDocuments}
        setCompressionModalVisible={setIsCompressionModalVisible}
        isCompressionModalVisible={isCompressionModalVisible}
        showDownloadWarning={false}
      />
      <CoreTable
        dataSource={spatialBundles}
        columns={columns}
        emptyText={emptyText}
        onRow={(record: any) => ({
          style: record.key === highlightKey ? HIGHLIGHT_STYLE : undefined,
        })}
        expandProps={{
          getDataSource: (record) => record.bundleFiles,
          recordDescription: "file information",
          childrenColumnName: "bundleFiles",
          matchChildColumnsToParent: true,
          rowExpandable: (record) => !record.isSingleFile && record.isParent,
        }}
      />
      <SpatialValidationDetailsDrawer
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        bundle={detailsBundle}
        onDownload={() => downloadBundle(detailsBundle)}
        purposeCodes={purposeCodes}
      />
    </>
  );

  if (!title) {
    return (
      <div data-testid="spatial-document-table" ref={containerRef}>
        {body}
      </div>
    );
  }

  const toggleExpanded = () => setIsExpanded((expanded) => !expanded);

  return (
    <div
      data-testid="spatial-document-table"
      ref={containerRef}
      style={{ border: "1px solid #EFEDF6", borderRadius: 4, marginBottom: 24 }}
    >
      <div
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
        onClick={collapsible ? toggleExpanded : undefined}
        onKeyDown={
          collapsible
            ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleExpanded();
              }
            }
            : undefined
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          backgroundColor: "#EFEDF6",
          cursor: collapsible ? "pointer" : undefined,
        }}
      >
        {collapsible &&
          (isExpanded ? (
            <DownOutlined style={{ color: "#5e46a1", fontSize: 12 }} />
          ) : (
            <RightOutlined style={{ color: "#5e46a1", fontSize: 12 }} />
          ))}
        <EnvironmentOutlined style={{ color: "#5e46a1" }} />
        <span style={{ fontWeight: "bold", color: "#5e46a1" }}>{title}</span>
        {showCountBadge && <Tag color="purple">{`${spatialBundles.length} detected`}</Tag>}
      </div>
      {isExpanded && <div style={{ padding: 16 }}>{body}</div>}
    </div>
  );
};

export default SpatialDocumentTable;
