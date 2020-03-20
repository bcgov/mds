import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { uniqBy, flattenDeep } from "lodash";
import { formatDate } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CoreTable from "@/components/common/CoreTable";
import CustomPropTypes from "@/customPropTypes";
import { SUCCESS_CHECKMARK } from "@/constants/assets";

const propTypes = {
  mines: PropTypes.objectOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  handleSearch: PropTypes.func.isRequired,
  isLoaded: PropTypes.bool.isRequired,
  filters: PropTypes.objectOf(PropTypes.any),
  sortField: PropTypes.string,
  sortDir: PropTypes.string,
};

const defaultProps = {
  filters: {},
  sortField: undefined,
  sortDir: undefined,
};

const columns = [
  {
    title: "Name",
    key: "mine_name",
    dataIndex: "mine_name",
    sortField: "mine_name",
    sorter: true,
    width: 150,
    render: (text, record) => (
      <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)} title="Name">
        {text}
        {record.verified_status && record.verified_status.healthy_ind && (
          <img
            alt="Verified"
            className="padding-small"
            src={SUCCESS_CHECKMARK}
            width="25"
            title={`Mine data verified by ${record.verified_status.verifying_user} on ${formatDate(
              record.verified_status.verifying_timestamp
            )}`}
          />
        )}
      </Link>
    ),
  },
  {
    title: "Number",
    key: "mine_no",
    dataIndex: "mine_no",
    sortField: "mine_no",
    sorter: true,
    width: 150,
    render: (text) => <div title="Number">{text}</div>,
  },
  {
    title: "Operational Status",
    key: "mine_operation_status_code",
    dataIndex: "mine_operation_status_code",
    sortField: "mine_operation_status_code",
    width: 150,
    render: (text) => <div title="Operational Status">{text}</div>,
  },
  {
    title: "Permits",
    key: "permit_numbers",
    dataIndex: "permit_numbers",
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
    key: "mine_region",
    dataIndex: "mine_region",
    sortField: "mine_region",
    sorter: true,
    width: 150,
    render: (text) => <div title="Region">{text}</div>,
  },
  {
    title: "Tenure",
    key: "tenure",
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
    key: "commodity",
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
    key: "tsf",
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
    mine_operation_status_code:
      mine.mine_status &&
      mine.mine_status.length > 0 &&
      mine.mine_status[0].status_labels &&
      mine.mine_status[0].status_labels.length > 0
        ? mine.mine_status[0].status_labels[0]
        : Strings.EMPTY_FIELD,
    permit_numbers:
      mine.mine_permit_numbers && mine.mine_permit_numbers.length > 0
        ? mine.mine_permit_numbers
        : [],
    mine_region: mine.mine_region ? mineRegionHash[mine.mine_region] : Strings.EMPTY_FIELD,
    commodity:
      mine.mine_type && mine.mine_type.length > 0
        ? uniqBy(
            flattenDeep(
              mine.mine_type.reduce((result, type) => {
                if (type.mine_type_detail.length > 0) {
                  result.push(
                    type.mine_type_detail
                      .filter((detail) => detail.mine_commodity_code)
                      .map((detail) => mineCommodityHash[detail.mine_commodity_code])
                  );
                }
                return result;
              }, [])
            )
          )
        : [],
    tenure:
      mine.mine_type && mine.mine_type.length > 0
        ? uniqBy(mine.mine_type.map((type) => mineTenureHash[type.mine_tenure_type_code]))
        : [],
    tsf: mine.mine_tailings_storage_facilities ? mine.mine_tailings_storage_facilities.length : 0,
    verified_status: mine.verified_status,
  }));

const handleTableChange = (handleSearch, tableFilters) => (pagination, filters, sorter) => {
  const params = {
    ...tableFilters,
    sort_field: sorter.order ? sorter.field : undefined,
    sort_dir: sorter.order ? sorter.order.replace("end", "") : undefined,
  };
  handleSearch(params);
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
      onChange: handleTableChange(props.handleSearch, props.filters),
    }}
  />
);

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;
