import React, { FC } from "react";
import { Tooltip } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

interface SpatialFilesRowLinkProps {
  onClick: () => void;
}

/** Points a spatial document row at the Spatial Files panel that lists the file. */
const SpatialFilesRowLink: FC<SpatialFilesRowLinkProps> = ({ onClick }) => (
  <Tooltip title="Scroll to the Spatial Files table" mouseEnterDelay={0.3}>
    <button
      type="button"
      className="spatial-files-row-link"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <EnvironmentOutlined />
      <span>in Spatial Files above</span>
    </button>
  </Tooltip>
);

export default SpatialFilesRowLink;
