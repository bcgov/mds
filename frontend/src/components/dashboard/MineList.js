import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import * as router from "@/constants/routes";
import * as String from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";

/**
 * @class MineList - paginated list of mines
 */

const propTypes = {
  mines: PropTypes.object.isRequired,
  mineIds: PropTypes.array.isRequired,
  mineRegionHash: PropTypes.object.isRequired,
  mineTenureHash: PropTypes.object.isRequired,
};

const columns = [
  {
    title: "Mine Name",
    width: 200,
    dataIndex: "mineName",
    render: (text, record) => <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>,
  },
  {
    title: "Mine No.",
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
    title: "Permit No.",
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
    render: (text, record) => (
      <div>
        {text &&
          text.map((tenure) => (
            <span className="mine_tenure" key={tenure.mine_tenure_type_guid}>
              {record.tenureHash[tenure.mine_tenure_type_code]}
            </span>
          ))}
        {!text && <div>{record.emptyField}</div>}
      </div>
    ),
  },
  {
    title: "TSF",
    dataIndex: "TSF",
    width: 150,
  },
];

const transformRowData = (mines, mineIds, mineRegionHash, mineTenureHash) =>
  mineIds.map((id) => ({
    key: id,
    emptyField: String.EMPTY_FIELD,
    mineName: mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_name : String.EMPTY_FIELD,
    mineNo: mines[id].mine_detail[0] ? mines[id].mine_detail[0].mine_no : String.EMPTY_FIELD,
    operationalStatus: mines[id].mine_status[0]
      ? mines[id].mine_status[0].status_labels[0]
      : String.EMPTY_FIELD,
    permit: mines[id].mine_permit[0] ? mines[id].mine_permit : null,
    region: mines[id].mine_detail[0].region_code
      ? mineRegionHash[mines[id].mine_detail[0].region_code]
      : String.EMPTY_FIELD,
    commodity: String.EMPTY_FIELD,
    tenure: mines[id].mine_type[0] ? mines[id].mine_type : null,
    tenureHash: mineTenureHash,
    TSF: mines[id].mine_tailings_storage_facility
      ? mines[id].mine_tailings_storage_facility.length
      : String.EMPTY_FIELD,
  }));

export const MineList = (props) => (
  <Table
    align="center"
    pagination={false}
    columns={columns}
    dataSource={transformRowData(
      props.mines,
      props.mineIds,
      props.mineRegionHash,
      props.mineTenureHash
    )}
    scroll={{ x: 1500 }}
    locale={{ emptyText: <NullScreen type="no-results" /> }}
  />
);

MineList.propTypes = propTypes;

export default MineList;
