import React from "react";
import { PropTypes } from "prop-types";
import { formatMoney } from "@common/utils/helpers";
import CoreTable from "@mds/common/components/common/CoreTable";
import { NOWOriginalValueTooltip } from "@/components/common/CoreTooltip";

const propTypes = {
  summary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

export const ReclamationSummary = (props) => {
  const columns = [
    {
      title: "Activity",
      dataIndex: "label",
      key: "label",
      render: (text) => <div title="Activity">{text}</div>,
    },
    {
      title: "Total Affected Area (ha)",
      dataIndex: "total",
      key: "total",
      render: (text, record) => (
        <div title="Total Affected Area (ha)">
          {text}{" "}
          <NOWOriginalValueTooltip
            style={{ marginLeft: "5%" }}
            originalValue={record.originalTotal}
            isVisible={record.originalTotal !== text}
          />
        </div>
      ),
    },
    {
      title: "Estimated Cost of Reclamation",
      dataIndex: "cost",
      key: "cost",
      render: (text) => <div title="Estimated Cost of Reclamation">{formatMoney(text)}</div>,
    },
  ];

  return (
    <div>
      <h3>Reclamation Summary</h3>
      <CoreTable columns={columns} dataSource={props.summary} />
    </div>
  );
};

ReclamationSummary.propTypes = propTypes;

export default ReclamationSummary;
