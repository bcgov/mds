import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { ELLIPSE, RED_ELLIPSE } from "@/constants/assets";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";

const columns = [
  {
    title: "Mine Name",
    width: 200,
    dataIndex: "mineName",
    render: (text, record) => <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>,
  },
  {
    title: "Mine #",
    width: 100,
    dataIndex: "mineNo",
  },
  {
    title: "Operational Status",
    dataIndex: "operationalStatus",
    width: 150,
    render: (text) => <div>{text}</div>,
  },
  {
    title: "Permit #",
    dataIndex: "permit",
    width: 150,
    render: (text, record) => (
      <div>
        {text && text.map(({ permit_no, permit_guid }) => <div key={permit_guid}>{permit_no}</div>)}
        {!text && <div>{record.emptyField}</div>}
      </div>
    ),
  },
  {
    title: "Region",
    dataIndex: "region",
    width: 150,
  },
  {
    title: "Commodity",
    dataIndex: "commodity",
    width: 150,
  },
  {
    title: "Tenure",
    dataIndex: "tenure",
    width: 150,
  },
  {
    title: "TSF",
    dataIndex: "TSF",
    width: 150,
  },
];

/**
 * @class MineList - paginated list of this.props.mines
 */

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  mineRegionHash: PropTypes.object.isRequired,
};

class MineList extends Component {
  render() {
    const data = this.props.mineIds.map((id) => ({
      key: id,
      emptyField: String.EMPTY_FIELD,
      mineName: this.props.mines[id].mine_detail[0]
        ? this.props.mines[id].mine_detail[0].mine_name
        : String.EMPTY_FIELD,
      mineNo: this.props.mines[id].mine_detail[0]
        ? this.props.mines[id].mine_detail[0].mine_no
        : String.EMPTY_FIELD,
      operationalStatus: this.props.mines[id].mine_status[0]
        ? this.props.mines[id].mine_status[0].status_labels[0]
        : String.EMPTY_FIELD,
      permit: this.props.mines[id].mine_permit[0] ? this.props.mines[id].mine_permit : null,
      region: this.props.mines[id].mine_detail[0].region_code
        ? this.props.mineRegionHash[this.props.mines[id].mine_detail[0].region_code]
        : String.EMPTY_FIELD,
      commodity: String.EMPTY_FIELD,
      tenure: String.EMPTY_FIELD,
      TSF: this.props.mines[id].mine_tailings_storage_facility
        ? this.props.mines[id].mine_tailings_storage_facility.length
        : String.EMPTY_FIELD,
    }));

    return (
      <Table
        align="center"
        pagination={false}
        columns={columns}
        dataSource={data}
        scroll={{ x: 1500, y: 400 }}
        locale={{ emptyText: <NullScreen type="no-results" /> }}
      />
    );
  }
}

MineList.propTypes = propTypes;

export default MineList;
