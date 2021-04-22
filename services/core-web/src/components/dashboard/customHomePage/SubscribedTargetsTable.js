import React, { Component } from "react";
import PropTypes from "prop-types";
import { Popconfirm, Tooltip } from "antd";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import SubscribeButton from "@/components/common/SubscribeButton";

/**
 * @class SubscribedTargetsTable is a user specific table of mines they have subscribed to with the ability to unsubscribe
 *
 */

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  coreActivityTargets: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  coreActivityTargetsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  createCoreActivityTarget: PropTypes.func.isRequired,
  deleteCoreActivityTarget: PropTypes.func.isRequired,
  coreActivityObjectTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class SubscribedTargetsTable extends Component {
  transformRowData = (targets) =>
    targets.map((target) => ({
      key: target.target_guid,
      type: target.core_activity_object_type_code,
      name: target.target_title,
    }));

  render() {
    const columns = [
      {
        title: "Name",
        key: "name",
        dataIndex: "name",
        render: (text) => <div title="Name">{text}</div>,
      },
      {
        title: "Type",
        key: "type",
        dataIndex: "type",
        sorter: (a, b) => a.type.localeCompare(b.type),
        render: (text) => (
          <div title="Type">{this.props.coreActivityObjectTypeOptionsHash[text]}</div>
        ),
      },
      {
        title: "",
        key: "subscribe",
        dataIndex: "",
        render: (text, record) => (
          <SubscribeButton target_guid={record.key} core_activity_object_type_code={record.type} />
        ),
      },
    ];

    return (
      <CoreTable
        condition={this.props.isLoaded}
        columns={columns}
        dataSource={this.transformRowData(this.props.coreActivityTargets)}
        tableProps={{
          align: "left",
          pagination: false,
        }}
      />
    );
  }
}

SubscribedTargetsTable.propTypes = propTypes;

export default SubscribedTargetsTable;
