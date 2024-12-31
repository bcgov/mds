import { AntdIconProps } from "@ant-design/icons/lib/components/AntdIcon";
import { ReactNodeLike } from "prop-types";
import React, { FC } from "react";

interface TableSummaryCardProps {
  iconColor: string;
  Icon: React.ComponentType<AntdIconProps>;
  title: string;
  content: string | number | JSX.Element | ReactNodeLike;
}

export const TableSummaryCard: FC<TableSummaryCardProps> = ({
  iconColor,
  Icon,
  title,
  content,
}) => (
  <div className="table-summary-card">
    <div>
      <Icon className={"table-summary-card-icon"} style={{ color: iconColor }} />
      <span className="table-summary-card-title">{title}</span>
    </div>
    <div className="table-summary-card-content">{content}</div>
  </div>
);

export default TableSummaryCard;
