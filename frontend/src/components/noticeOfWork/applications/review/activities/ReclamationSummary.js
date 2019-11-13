import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import * as Strings from "@/constants/strings";

const propTypes = {
  summary: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ReclamationSummary = (props) => {
  const columns = [
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      render: (text) => <div title="Activity">{text}</div>,
    },
    {
      title: "Total Effected Area (ha)",
      dataIndex: "effectedArea",
      key: "effectedArea",
      render: (text) => <div title="Total Effected Area (ha)">{text}</div>,
    },
    {
      title: "Estimated Cost of Reclamation",
      dataIndex: "cost",
      key: "cost",
      render: (text) => <div title="Estimated Cost of Reclamation">{text}</div>,
    },
  ];

  const transformData = (activities) =>
    activities.map((activity) => ({
      accessType: activity.quantity || Strings.EMPTY_FIELD,
      description: activity.description || Strings.EMPTY_FIELD,
      capacity: activity.capacity || Strings.EMPTY_FIELD,
    }));

  return (
    <div>
      <h3>ReclamationSummary</h3>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformData(props.summary)}
        locale={{
          emptyText: "No data",
        }}
      />
    </div>
  );
};

ReclamationSummary.propTypes = propTypes;

export default ReclamationSummary;
