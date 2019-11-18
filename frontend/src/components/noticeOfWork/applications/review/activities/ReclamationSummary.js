import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";

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
      title: "Total Effected Area (ha)",
      dataIndex: "total",
      key: "total",
      render: (text) => <div title="Total Effected Area (ha)">{text}</div>,
    },
    {
      title: "Estimated Cost of Reclamation",
      dataIndex: "cost",
      key: "cost",
      render: (text) => <div title="Estimated Cost of Reclamation">{text}</div>,
    },
  ];

  return (
    <div>
      <h3>Reclamation Summary</h3>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={props.summary}
        locale={{
          emptyText: "No data",
        }}
      />
    </div>
  );
};

ReclamationSummary.propTypes = propTypes;

export default ReclamationSummary;
