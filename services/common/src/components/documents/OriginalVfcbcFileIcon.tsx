import React from "react";
import { Tooltip } from "antd";
import ImportOutlined from "@ant-design/icons/ImportOutlined";

interface OriginalVfcbcFileIconProps {
  // When set, the icon is wrapped in a span with this class
  containerClassName?: string;
}

/**
 * Marks a file that is the original vFCBC upload (not one that has since been replaced in Core).
 */
const OriginalVfcbcFileIcon = ({ containerClassName }: OriginalVfcbcFileIconProps) => {
  const icon = (
    <Tooltip title="Imported from vFCBC" placement="top">
      <ImportOutlined
        style={{ fontSize: "14px", color: "#606060", marginLeft: "6px" }}
        aria-label="Imported from vFCBC"
      />
    </Tooltip>
  );
  return containerClassName ? <span className={containerClassName}>{icon}</span> : icon;
};

export default OriginalVfcbcFileIcon;
