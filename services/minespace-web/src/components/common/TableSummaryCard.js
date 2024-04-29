import React from "react";
import PropTypes from "prop-types";
import { Icon as LegacyIcon } from "@ant-design/compatible";

const propTypes = {
  type: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.element,
    PropTypes.ReactNodeLike,
  ]).isRequired,
};

export const TableSummaryCard = (props) => (
  <div className="table-summary-card">
    <div>
      <LegacyIcon className={`table-summary-card-icon color-${props.type}`} type={props.icon} />
      <span className="table-summary-card-title">{props.title}</span>
    </div>
    <div className="table-summary-card-content">{props.content}</div>
  </div>
);

TableSummaryCard.propTypes = propTypes;

export default TableSummaryCard;
