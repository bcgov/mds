import React from "react";
import { func, objectOf, arrayOf, string, bool } from "prop-types";
import { Link } from "react-router-dom";
import { isEmpty, uniqBy } from "lodash";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";
import CustomPropTypes from "@/customPropTypes";
import { SUCCESS_CHECKMARK } from "@/constants/assets";

/**
 * @class MineList - paginated list of mines
 */

const propTypes = {
  mines: objectOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: objectOf(string).isRequired,
  mineTenureHash: objectOf(string).isRequired,
  mineCommodityOptionsHash: objectOf(string).isRequired,
  handleMineSearch: func.isRequired,
  sortField: string,
  sortDir: string,
  isLoaded: bool.isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
};

const columns = [
  {
    title: "Name",
    dataIndex: "mine_name",
    sortField: "mine_name",
    width: 150,
    render: (text, record) => (
      <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)} title="Name">
        {text}
        {record.verified_status.healthy_ind && (
          <img
            alt="Verified"
            className="padding-small"
            src={SUCCESS_CHECKMARK}
            width="25"
            title={`Mine data verified by ${record.verified_status.verifying_user}`}
          />
        )}
      </Link>
    ),
    sorter: true,
  },
  {
    title: "Number",
    dataIndex: "mine_no",
    sortField: "mine_no",
    width: 150,
    render: (text) => <div title="Number">{text}</div>,
    sorter: true,
  },
  {
    title: "Operational Status",
    dataIndex: "operationalStatus",
    sortField: "mine_operation_status_code",
    width: 150,
    render: (text) => <div title="Operational Status">{text}</div>,
  },
  {
    title: "Permits",
    dataIndex: "permitNo",
    width: 150,
    render: (text) => (
      <div title="Permits">
        {(text && text.length > 0 && (
          <ul className="mine-list__permits">
            {text.map((permitNo) => (
              <li key={permitNo}>{permitNo}</li>
            ))}
          </ul>
        )) ||
          Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Region",
    dataIndex: "mine_region",
    sortField: "mine_region",
    width: 150,
    render: (text) => <div title="Region">{text}</div>,
    sorter: true,
  },
  {
    title: "Tenure",
    dataIndex: "tenure",
    width: 150,
    render: (text) => (
      <div title="Tenure">
        {(text && text.length > 0 && text.join(", ")) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "Commodity",
    dataIndex: "commodity",
    width: 150,
    render: (text) => (
      <div title="Commodity">
        {(text && text.length > 0 && text.join(", ")) || Strings.EMPTY_FIELD}
      </div>
    ),
  },
  {
    title: "TSF",
    dataIndex: "tsf",
    width: 150,
    render: (text) => <div title="TSF">{text}</div>,
  },
];

const transformRowData = (mines, mineRegionHash, mineTenureHash, mineCommodityHash) =>
  Object.values(mines).map((mine) => ({
    key: mine.mine_guid,
    mine_name: mine.mine_name || Strings.EMPTY_FIELD,
    mine_no: mine.mine_no || Strings.EMPTY_FIELD,
    operationalStatus:
      mine.mine_status &&
      mine.mine_status.length > 0 &&
      mine.mine_status[0].status_labels &&
      mine.mine_status[0].status_labels.length > 0
        ? mine.mine_status[0].status_labels[0]
        : Strings.EMPTY_FIELD,
    permitNo:
      mine.mine_permit_numbers && mine.mine_permit_numbers.length > 0
        ? mine.mine_permit_numbers
        : [],
    mine_region: mine.mine_region ? mineRegionHash[mine.mine_region] : Strings.EMPTY_FIELD,
    commodity:
      mine.mine_type && mine.mine_type.length > 0
        ? uniqBy(
            mine.mine_type.map(
              (type) =>
                type.mine_type_detail &&
                type.mine_type_detail.length > 0 &&
                type.mine_type_detail
                  .filter((detail) => detail.mine_commodity_code)
                  .map((detail) => mineCommodityHash[detail.mine_commodity_code])
            )
          )
        : [],
    tenure:
      mine.mine_type && mine.mine_type.length > 0
        ? uniqBy(mine.mine_type.map((type) => mineTenureHash[type.mine_tenure_type_code]))
        : null,
    tsf: mine.mine_tailings_storage_facilities
      ? mine.mine_tailings_storage_facilities.length
      : Strings.EMPTY_FIELD,
    verified_status: mine.verified_status,
  }));

const handleTableChange = (updateMineList) => (pagination, filters, sorter) => {
  const params = {
    results: pagination.pageSize,
    page: pagination.current,
    sort_field: sorter.field,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : sorter.order,
    ...filters,
  };
  updateMineList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: dir && column.sortField === field ? dir.concat("end") : false,
  }));

export const MineList = (props) => (
  <CoreTable
    condition={props.isLoaded}
    columns={applySortIndicator(columns, props.sortField, props.sortDir)}
    dataSource={transformRowData(
      props.mines,
      props.mineRegionHash,
      props.mineTenureHash,
      props.mineCommodityOptionsHash
    )}
    tableProps={{
      align: "left",
      pagination: false,
      locale: { emptyText: <NullScreen type="no-results" /> },
      onChange: handleTableChange(props.handleMineSearch),
    }}
  />
);

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;
