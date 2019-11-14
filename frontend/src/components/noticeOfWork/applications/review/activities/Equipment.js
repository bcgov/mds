import React from "react";
import { PropTypes } from "prop-types";
import { Table } from "antd";
import * as Strings from "@/constants/strings";

const propTypes = {
  equipment: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)),
};

const defaultProps = {
  equipment: [],
};

export const Equipment = (props) => {
  const columns = [
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <div title="Quantity">{text}</div>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <div title="Description">{text}</div>,
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (text) => <div title="Capacity">{text}</div>,
    },
  ];

  const transformData = (equipmentList) =>
    equipmentList.map((equipment) => ({
      quantity: equipment.quantity || Strings.EMPTY_FIELD,
      description: equipment.description || Strings.EMPTY_FIELD,
      capacity: equipment.capacity || Strings.EMPTY_FIELD,
    }));

  return (
    <div>
      <h4>Equipment</h4>
      <Table
        align="left"
        pagination={false}
        columns={columns}
        dataSource={transformData(props.equipment)}
        locale={{
          emptyText: "No equipment related to this activity",
        }}
      />
      <br />
    </div>
  );
};

Equipment.propTypes = propTypes;
Equipment.defaultProps = defaultProps;

export default Equipment;
