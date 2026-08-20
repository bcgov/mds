import React, { FC } from "react";
import { Tooltip } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

interface SpatialFilesRowLinkProps {
  onClick: () => void;
  label?: string;
}

/** Points a spatial document row at the Spatial Files panel that holds its validation details. */
const SpatialFilesRowLink: FC<SpatialFilesRowLinkProps> = ({
  onClick,
  label = "in Spatial Files above",
}) => (
  <Tooltip title="Jump to this file's validation details" mouseEnterDelay={0.3}>
    <a
      className="spatial-files-row-link"
      role="link"
      tabIndex={0}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }
      }}
    >
      <EnvironmentOutlined />
      <span>{label}</span>
    </a>
  </Tooltip>
);

export default SpatialFilesRowLink;
