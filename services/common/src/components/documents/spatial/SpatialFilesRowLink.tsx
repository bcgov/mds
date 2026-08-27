import React, { FC } from "react";
import { Tooltip } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

interface SpatialFilesRowLinkProps {
  onClick: () => void;
}

/** Points a spatial document row at the Spatial Files panel that lists the file. */
const SpatialFilesRowLink: FC<SpatialFilesRowLinkProps> = ({ onClick }) => (
  <Tooltip title="Scroll to the Spatial Files table" mouseEnterDelay={0.3}>
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
      <span>in Spatial Files above</span>
    </a>
  </Tooltip>
);

export default SpatialFilesRowLink;
