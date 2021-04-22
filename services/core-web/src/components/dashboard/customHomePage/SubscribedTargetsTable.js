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
};

export class SubscribedTargetsTable extends Component {
  transformRowData = (targets) =>
    targets.map((target) => ({
      key: target.target_guid,
      type: target.target_object_type_code,
      name: target.target_guid,
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
        render: (text) => <div title="Type">{text}</div>,
      },
      {
        title: "",
        key: "subscribe",
        dataIndex: "",
        render: (text, record) => <SubscribeButton target_guid={record.key} />
      },
    ];

    return (
      <CoreTable
        condition={this.props.isLoaded}
        columns={columns}
        dataSource={this.transformRowData(
          this.props.coreActivityTargets
        )}
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
