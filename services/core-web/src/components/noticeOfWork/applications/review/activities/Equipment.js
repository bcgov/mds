import React from "react";
import { Table, Button } from "antd";
import { PropTypes } from "prop-types";
import { TRASHCAN } from "@/constants/assets";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  equipment: CustomPropTypes.activityEquipment,
  activity: PropTypes.string.isRequired,
  editRecord: PropTypes.func.isRequired,
  addRecord: PropTypes.func.isRequired,
};

const defaultProps = {
  equipment: [],
};

export const Equipment = (props) => {
  const targetActivity = `${props.activity}.equipment`;

  const editEquipment = (event, rowIndex, isDelete) => {
    const equipmentToChange = props.equipment[rowIndex];
    let removeOnly = false;
    if (isDelete) {
      if (!equipmentToChange.equipment_id) {
        removeOnly = true;
      }
    } else {
      equipmentToChange[event.target.name] = event.target.value;
    }
    props.editRecord(equipmentToChange, targetActivity, rowIndex, isDelete, removeOnly);
  };

  const addEquipment = () => {
    const newEquipment = {
      quantity: "",
      description: "",
      capacity: "",
    };
    props.addRecord(targetActivity, newEquipment);
  };

  const standardColumns = [
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <div title="Quantity">
          <div className="inline-flex">
            <input
              name="quantity"
              type="number"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editEquipment(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text, record) => (
        <div title="Description">
          <div className="inline-flex">
            <input
              name="description"
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editEquipment(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      render: (text, record) => (
        <div title="Capacity">
          <div className="inline-flex">
            <input
              name="capacity"
              type="text"
              disabled={props.isViewMode}
              value={text}
              onChange={(e) => editEquipment(e, record.index, false)}
            />
          </div>
        </div>
      ),
    },
  ];

  const removeColumn = {
    dataIndex: "remove",
    key: "remove",
    render: (text, record) => (
      <div name="remove" title="remove">
        <Button
          type="primary"
          size="small"
          onClick={(e) => editEquipment(e, record.index, true)}
          ghost
        >
          <img name="remove" src={TRASHCAN} alt="Remove Activity" />
        </Button>
      </div>
    ),
  };

  const columns = (isViewMode) =>
    !isViewMode ? [...standardColumns, removeColumn] : standardColumns;

  const transformData = (equipmentList) =>
    equipmentList
      .map((equipment, index) => ({
        quantity: equipment.quantity || "",
        description: equipment.description || "",
        capacity: equipment.capacity || "",
        state_modified: equipment.state_modified || "",
        index,
      }))
      .filter((equipment) => !equipment.state_modified);
  return (
    <div>
      <h4>Equipment</h4>
      <Table
        align="left"
        pagination={false}
        columns={columns(props.isViewMode)}
        dataSource={transformData(props.equipment)}
        locale={{
          emptyText: "No equipment related to this activity",
        }}
      />
      {!props.isViewMode && (
        <Button type="primary" onClick={() => addEquipment()}>
          Add Equipment
        </Button>
      )}
      <br />
    </div>
  );
};

Equipment.propTypes = propTypes;
Equipment.defaultProps = defaultProps;

export default Equipment;
