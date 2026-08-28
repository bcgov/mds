import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Tag, Typography } from "antd";
import { DownOutlined, EnvironmentOutlined, RightOutlined } from "@ant-design/icons";
import SpatialDocumentTable from "@mds/common/components/documents/spatial/SpatialDocumentTable";
import { getSpatialBundlePurposeCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { ISpatialBundle } from "@mds/common/interfaces/document/spatialBundle.interface";
import * as Permission from "@/constants/permissions";

interface NOWSpatialFilesProps {
  spatialDocumentBundles: ISpatialBundle[];
  isViewMode: boolean;
  mineGuid: string;
  /** A changed id scrolls the panel into view, sent when a document row links up to it */
  scrollRequestId?: number;
}

const HEADER_COLOR = "#5e46a1";
const BAND_COLOR = "#EFEDF6";

const NOWSpatialFiles: FC<NOWSpatialFilesProps> = ({
  spatialDocumentBundles,
  isViewMode,
  mineGuid,
  scrollRequestId,
}) => {
  const purposeCodesAll = useSelector(getSpatialBundlePurposeCodes) || [];
  const userRoles = useSelector(getUserAccessData) || [];
  const canEdit = !isViewMode && userRoles.includes(Permission.EDIT_PERMITS);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const purposeCodes = useMemo(
    () => purposeCodesAll.filter((p) => p.active_ind !== false),
    [purposeCodesAll]
  );

  useEffect(() => {
    if (!scrollRequestId) {
      return;
    }
    containerRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [scrollRequestId]);

  if (!spatialDocumentBundles.length) {
    return null;
  }

  const toggleExpanded = () => setIsExpanded((expanded) => !expanded);

  return (
    <div
      ref={containerRef}
      style={{ border: `1px solid ${BAND_COLOR}`, borderRadius: 4, marginBottom: 24 }}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={toggleExpanded}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "12px 16px",
          border: 0,
          backgroundColor: BAND_COLOR,
          font: "inherit",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        {isExpanded ? (
          <DownOutlined style={{ color: HEADER_COLOR, fontSize: 12 }} />
        ) : (
          <RightOutlined style={{ color: HEADER_COLOR, fontSize: 12 }} />
        )}
        <EnvironmentOutlined style={{ color: HEADER_COLOR }} />
        <span style={{ fontWeight: "bold", color: HEADER_COLOR }}>Spatial Files</span>
        <Tag color="purple">{`${spatialDocumentBundles.length} detected`}</Tag>
      </button>
      {isExpanded && (
        <div style={{ padding: 16 }}>
          <Typography.Paragraph type="secondary">
            A read-only view of spatial files detected during import. Mine Boundary selections are
            preserved when a bundle is re-synced. To replace or archive a file, use the Application
            Documents table below.
          </Typography.Paragraph>
          <SpatialDocumentTable
            documents={[]}
            spatialBundles={spatialDocumentBundles}
            purposeCodes={purposeCodes}
            canEditPurposes={canEdit}
            mineGuid={mineGuid}
            emptyText="No spatial files detected on this application."
          />
        </div>
      )}
    </div>
  );
};

export default NOWSpatialFiles;
