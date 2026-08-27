import React, { FC, useState } from "react";
import { Alert, Button, Drawer, Modal, Tooltip, Typography, List, Space, Divider, Tag } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DownloadOutlined,
  FullscreenOutlined,
  MinusCircleFilled,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  ISpatialBundle,
  ISpatialBundlePurposeCode,
  ISpatialValidationChecks,
} from "@mds/common/interfaces/document/spatialBundle.interface";
import { GeomarkMapPreview } from "./ViewSpatialDetail";

interface SpatialValidationDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  bundle: ISpatialBundle | null;
  onDownload?: () => void;
  purposeCodes?: ISpatialBundlePurposeCode[];
}

const GEOMARK_GLOSSARY_URL = "https://apps.gov.bc.ca/pub/geomark/docs/glossary.html";
const PREVIEW_MAP_HEIGHT = 200;
const PREVIEW_MAP_ID = "spatial-preview-map";
const EXPANDED_MAP_ID = "spatial-expanded-map";

const GlossaryLink: FC<{ term: string }> = ({ term }) => (
  <Tooltip title="View this term in the Geomark glossary" mouseEnterDelay={0.3}>
    <a
      href={`${GEOMARK_GLOSSARY_URL}#${term}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Geomark glossary definition of ${term}`}
      style={{ marginLeft: 4 }}
    >
      <QuestionCircleOutlined className="icon-sm" />
    </a>
  </Tooltip>
);

const CheckIcon: FC<{ value: boolean | null | undefined }> = ({ value }) => {
  if (value === true) {
    return <CheckCircleFilled style={{ color: "#52c41a" }} />;
  }
  if (value === false) {
    return <CloseCircleFilled style={{ color: "#ff4d4f" }} />;
  }
  return <MinusCircleFilled style={{ color: "#d9d9d9" }} />;
};

const formatNumber = (value: number, maximumFractionDigits: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits });

const formatExtent = (checks: ISpatialValidationChecks) => {
  if (
    checks.minX == null ||
    checks.minY == null ||
    checks.maxX == null ||
    checks.maxY == null
  ) {
    return undefined;
  }
  return `W ${checks.minX} · S ${checks.minY} · E ${checks.maxX} · N ${checks.maxY}`;
};

const formatCentroid = (checks: ISpatialValidationChecks) => {
  if (typeof checks.centroidX !== "number" || typeof checks.centroidY !== "number") {
    return undefined;
  }
  return `${formatNumber(checks.centroidY, 6)}, ${formatNumber(checks.centroidX, 6)}`;
};

const formatArea = (area?: number | null) =>
  typeof area === "number" ? `${formatNumber(area / 10000, 2)} ha` : undefined;

const formatLength = (length?: number | null) => {
  if (typeof length !== "number") {
    return undefined;
  }
  return length >= 1000 ? `${formatNumber(length / 1000, 2)} km` : `${formatNumber(length, 1)} m`;
};

const formatClearance = (clearance?: number | null) =>
  typeof clearance === "number" ? `${formatNumber(clearance, 4)} m` : undefined;

const formatFlag = (flag?: boolean | null) => {
  if (typeof flag !== "boolean") {
    return undefined;
  }
  return flag ? "Yes" : "No";
};

const formatCount = (count?: number | null) =>
  typeof count === "number" ? formatNumber(count, 0) : undefined;

const VALIDATION_LABELS: Record<string, string> = {
  VALID: "Valid",
  INVALID: "Failed",
  UNABLE_TO_VALIDATE: "Unable to validate",
};

const VALIDATION_COLORS: Record<string, string> = {
  VALID: "success",
  INVALID: "error",
  UNABLE_TO_VALIDATE: "warning",
};

const SpatialValidationDetailsDrawer: FC<SpatialValidationDetailsDrawerProps> = ({
  open,
  onClose,
  bundle,
  onDownload,
  purposeCodes = [],
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  if (!bundle) {
    return null;
  }

  const checks = bundle.validation_checks || {};
  const missing = checks.missing_extensions || [];
  const bundleFiles = bundle.bundleFiles || bundle.bundle_documents || [];

  const title = bundle.name || bundle.document_name || "Spatial File";
  const status = bundle.validation_status || "Not available";
  const purposeLabels = (bundle.purpose_codes || []).map(
    (code) =>
      purposeCodes.find((purpose) => purpose.spatial_bundle_purpose_code === code)?.description ||
      code
  );

  const validity = formatFlag(checks.isValid);
  const geometryValidity =
    validity && checks.isValid === false && checks.validationError
      ? `${validity} — ${checks.validationError}`
      : validity;

  const metadataRows = [
    {
      label: "Validation Status",
      value: <Tag color={VALIDATION_COLORS[status]}>{VALIDATION_LABELS[status] || status}</Tag>,
    },
    { label: "Bundle Name", value: title },
    {
      label: "Purpose",
      value: purposeLabels.length ? purposeLabels.join(", ") : "Not assigned",
    },
    { label: "Geometry Type", value: checks.geometryType },
    { label: "Parts", value: formatCount(checks.numParts) },
    { label: "Vertices", value: formatCount(checks.numVertices) },
    { label: "Area", value: formatArea(checks.area) },
    { label: "Length", value: formatLength(checks.length) },
    { label: "Centroid (lat, long)", value: formatCentroid(checks) },
    { label: "Bounding Box", value: formatExtent(checks) },
    {
      label: "Geometry is valid",
      value: geometryValidity,
      glossaryTerm: "isValid",
    },
    {
      label: "Geometry is simple",
      value: formatFlag(checks.isSimple),
      glossaryTerm: "isSimple",
    },
    {
      label: "Geometry is robust",
      value: formatFlag(checks.isRobust),
      glossaryTerm: "isRobust",
    },
    {
      label: "Minimum Clearance",
      value: formatClearance(checks.minimumClearance),
      glossaryTerm: "minimumClearance",
    },
  ].filter((row) => row.value !== undefined && row.value !== null);

  return (
    <Drawer
      title={title}
      placement="right"
      width={600}
      onClose={() => {
        setIsMapExpanded(false);
        onClose();
      }}
      open={open}
      destroyOnClose
    >
      <Typography.Title level={5}>Validation Checks</Typography.Title>
      <List
        size="small"
        dataSource={[
          {
            label: "Location is within BC",
            value: checks.in_bc,
          },
          {
            label: "Is in the required projection",
            value: checks.bc_albers,
          },
          {
            label: "File size greater than 0",
            value: checks.file_size_gt_0,
          },
        ]}
        renderItem={(item) => (
          <List.Item>
            <Space>
              <CheckIcon value={item.value} />
              <div>{item.label}</div>
            </Space>
          </List.Item>
        )}
      />

      {bundle.validation_error && (
        <Alert type="error" showIcon message={bundle.validation_error} style={{ marginTop: 8 }} />
      )}

      {onDownload && (
        <Button icon={<DownloadOutlined />} onClick={onDownload} style={{ marginTop: 16 }}>
          Download
        </Button>
      )}

      <Divider />
      <Typography.Title level={5}>Preview</Typography.Title>
      {bundle.geomark_id ? (
        <div
          role="button"
          tabIndex={0}
          aria-label="Expand map preview"
          data-testid="spatial-map-preview"
          onClick={() => setIsMapExpanded(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsMapExpanded(true);
            }
          }}
          style={{
            position: "relative",
            height: PREVIEW_MAP_HEIGHT,
            overflow: "hidden",
            border: "1px solid #EFEDF6",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          <GeomarkMapPreview
            geomarkId={bundle.geomark_id}
            height={PREVIEW_MAP_HEIGHT}
            mapId={PREVIEW_MAP_ID}
          />
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
              pointerEvents: "none",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 12,
              color: "#5e46a1",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <FullscreenOutlined /> Expand
          </div>
        </div>
      ) : (
        <Alert
          type="info"
          showIcon
          message="Map preview unavailable"
          description={
            bundle.validation_status === "INVALID"
              ? "This file did not produce a GeoMark geometry. Review the validation details below."
              : "No GeoMark geometry is associated with this spatial file."
          }
        />
      )}

      <Divider />
      <Typography.Title level={5}>Metadata</Typography.Title>
      <List
        size="small"
        dataSource={metadataRows}
        renderItem={(item) => (
          <List.Item>
            <Typography.Text>
              <strong>{item.label}:</strong> {item.value}
              {item.glossaryTerm && <GlossaryLink term={item.glossaryTerm} />}
            </Typography.Text>
          </List.Item>
        )}
      />

      {(missing.length > 0 || bundleFiles.length > 0) && (
        <>
          <Divider />
          <Typography.Title level={5}>Bundle Contents</Typography.Title>
          <List
            size="small"
            dataSource={[
              ...bundleFiles.map((file) => ({
                name: file.document_name,
                found: true,
              })),
              ...missing.map((extension) => ({
                name: `${extension.startsWith(".") ? extension : `.${extension}`} file`,
                found: false,
              })),
            ]}
            renderItem={(item) => (
              <List.Item>
                <Typography.Text type={item.found ? undefined : "danger"}>
                  {item.name} {item.found ? "" : "not found"}
                </Typography.Text>
              </List.Item>
            )}
          />
        </>
      )}

      <Modal
        title={title}
        open={isMapExpanded}
        onCancel={() => setIsMapExpanded(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        <GeomarkMapPreview geomarkId={bundle.geomark_id} height={560} mapId={EXPANDED_MAP_ID} />
      </Modal>
    </Drawer>
  );
};

export default SpatialValidationDetailsDrawer;
