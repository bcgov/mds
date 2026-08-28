import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Tag, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
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

export interface SpatialDocumentTableProps extends GenericDocTableProps<ISpatialBundle> {
  documents: IMineDocument[];
  categoryText?: string;
  /**
   * Server-side bundles, used instead of grouping the documents client-side. Their validation
   * results also switch the table to the validation view: validation, type and file-set columns,
   * Preview Shape and Details actions, and none of the upload columns.
   */
  spatialBundles?: ISpatialBundle[];
  purposeCodes?: ISpatialBundlePurposeCode[];
  canEditPurposes?: boolean;
  emptyText?: string;
  /** Used when individual document rows do not carry mine_guid */
  mineGuid?: string;
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

// The tag only has room for the headline; the Details drawer carries the full explanation.
const summarizeError = (error: string) => {
  const firstSentence = /^[^.]*\./.exec(error);
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

const validationReason = (record: any) => {
  if (record.validation_status === "INVALID" && record.validation_error) {
    return ` — ${summarizeError(record.validation_error)}`;
  }
  if (
    record.validation_status === "UNABLE_TO_VALIDATE" &&
    record.validation_checks?.missing_extensions?.length
  ) {
    return ` — missing ${record.validation_checks.missing_extensions.join(", ")}`;
  }
  return "";
};

const bundleCaption = (prefix: string, extensions: string[], missing: string[]) => {
  if (!extensions.length) {
    return "";
  }
  const missingText = missing.length ? ` (missing ${missing.join(" ")})` : "";
  return `${prefix} · ${extensions.join(" ")}${missingText}`;
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
  purposeCodes = [],
  canEditPurposes = false,
  emptyText,
  mineGuid,
}) => {
  const dispatch = useDispatch();
  const [isCompressionModalVisible, setIsCompressionModalVisible] = useState(false);
  const [compressionFiles, setCompressionFiles] = useState<IMineDocument[] | null>(null);
  const [spatialBundles, setSpatialBundles] = useState<any[]>([]);
  const [detailsBundle, setDetailsBundle] = useState<ISpatialBundle | null>(null);
  const username = useSelector(getFormattedUserName);
  const showBundleValidation = Boolean(spatialBundlesProp?.length);

  const handleGetSpatialBundles = async () => {
    if (spatialBundlesProp?.length) {
      setSpatialBundles(spatialBundlesProp.map(bundleToRow));
      return;
    }

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

    setSpatialBundles(groupSpatialBundles(docs));
  };

  useEffect(() => {
    if (documents) {
      handleGetSpatialBundles();
    }
  }, [documents, spatialBundlesProp]);

  // Bundles returned by the API carry no mine_guid; compression needs one to resolve the files.
  const fallbackMineGuid = mineGuid || documents.find((doc) => doc.mine_guid)?.mine_guid;
  const mineDocuments = (compressionFiles ?? documents).map(
    (doc) => new MineDocument({ ...doc, mine_guid: doc.mine_guid ?? fallbackMineGuid })
  );
  const togglePurpose = async (record: any, purposeCode: string, checked: boolean) => {
    if (!canEditPurposes || !record.bundle_id || !fallbackMineGuid) {
      return;
    }
    const current = new Set<string>(record.purpose_codes || []);
    if (checked) {
      current.add(purposeCode);
    } else {
      current.delete(purposeCode);
    }
    try {
      const updated: any = await (dispatch(
        updateSpatialBundlePurposes({
          mineGuid: fallbackMineGuid,
          bundle_id: record.bundle_id,
          purpose_codes: Array.from(current),
        }) as any
      ) as any).unwrap();
      setSpatialBundles((prev) =>
        prev.map((b) =>
          String(b.bundle_id) === String(record.bundle_id)
            ? { ...b, purpose_codes: updated?.purpose_codes || Array.from(current) }
            : b
        )
      );
    } catch {
      // rejectHandler already surfaced the failure
    }
  };

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

  const openDetails = (_, record) => setDetailsBundle(record);

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
    if (showBundleValidation) {
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
    ...(showBundleValidation
      ? [
        {
          key: "preview-shape",
          label: "Preview Shape",
          clickFunction: previewShape,
        },
        {
          key: "details",
          label: "Details",
          clickFunction: openDetails,
        },
      ]
      : []),
  ];

  const categoryColumn = categoryText
    ? [
      {
        key: "category",
        title: "Category",
        render: () => <div title="Category">{categoryText}</div>,
      },
    ]
    : [];

  const typeColumn = showBundleValidation
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

  const validationColumn = showBundleValidation
    ? [
      {
        key: "validation",
        title: "Validation",
        render: (_text, record) => {
          if (!record.isParent) {
            return null;
          }
          const status = record.validation_status;
          if (!status) {
            return <Tag>Pending</Tag>;
          }
          const label = VALIDATION_LABEL[status] || status;
          const reason = validationReason(record);
          return (
            <Tag color={VALIDATION_TAG_COLOR[status]} icon={VALIDATION_TAG_ICON[status]}>
              {`${label}${reason}`}
            </Tag>
          );
        },
      },
    ]
    : [];

  const nameColumn = showBundleValidation
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
        const caption = bundleCaption(prefix, extensions, missing);
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
    ...(showBundleValidation
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

  return (
    <div data-testid="spatial-document-table">
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
        expandProps={{
          getDataSource: (record) => record.bundleFiles,
          recordDescription: "file information",
          childrenColumnName: "bundleFiles",
          matchChildColumnsToParent: true,
          rowExpandable: (record) => !record.isSingleFile && record.isParent,
        }}
      />
      <SpatialValidationDetailsDrawer
        bundle={detailsBundle}
        onClose={() => setDetailsBundle(null)}
        onDownload={() => downloadBundle(detailsBundle)}
        purposeCodes={purposeCodes}
      />
    </div>
  );
};

export default SpatialDocumentTable;
