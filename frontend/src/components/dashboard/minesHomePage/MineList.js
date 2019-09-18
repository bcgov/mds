import React from "react";
import { func, objectOf, arrayOf, string, bool, number } from "prop-types";
import { Link } from "react-router-dom";
import { Table } from "antd";
import { uniqBy, isEmpty } from "lodash";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import TableLoadingWrapper from "@/components/common/wrappers/TableLoadingWrapper";
import CustomPropTypes from "@/customPropTypes";
import { SUCCESS_CHECKMARK } from "@/constants/assets";
import { getTableHeaders } from "@/utils/helpers";

/**
 * @class MineList - paginated list of mines
 */

const propTypes = {
  mines: objectOf(CustomPropTypes.mine).isRequired,
  mineIds: arrayOf(string).isRequired,
  mineRegionHash: objectOf(string).isRequired,
  mineTenureHash: objectOf(string).isRequired,
  mineCommodityOptionsHash: objectOf(string).isRequired,
  handleMineSearch: func.isRequired,
  sortField: string,
  sortDir: string,
  isLoaded: bool.isRequired,
  paginationPerPage: number.isRequired,
};

const defaultProps = {
  sortField: null,
  sortDir: null,
};

const columns = [
  {
    title: "Mine Name",
    dataIndex: "mineName",
    sortField: "mine_name",
    width: 150,
    render: (text, record) => (
      <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>
        {text}
        {record.verified_status.healthy_ind && (
          <img
            alt="checkmark"
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
    title: "Mine No.",
    dataIndex: "mineNo",
    sortField: "mine_no",
    width: 150,
    render: (text) => <div title="Mine Number">{text}</div>,
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
    title: "Permit No.",
    dataIndex: "permit",
    width: 150,
    render: (text, record) => (
      <div title="Permit Number">
        <ul className="mine-list__permits">
          {text &&
            uniqBy(text, "permit_no").map(({ permit_no, permit_guid }) => (
              <li key={permit_guid}>{permit_no}</li>
            ))}
          {!text && <li>{record.emptyField}</li>}
        </ul>
      </div>
    ),
  },
  {
    title: "Region",
    dataIndex: "region",
    sortField: "mine_region",
    width: 150,
    render: (text, record) => (
      <div title="Region">
        {text}
        {!text && <div>{record.emptyField}</div>}
      </div>
    ),
    sorter: true,
  },
  {
    title: "Tenure",
    dataIndex: "tenure",
    width: 150,
    render: (text, record) => (
      <div title="Tenure">
        {text &&
          text.map((tenure) => (
            <span className="mine_tenure" key={tenure.mine_type_guid}>
              {record.tenureHash[tenure.mine_tenure_type_code]}
            </span>
          ))}
        {!text && <div>{record.emptyField}</div>}
      </div>
    ),
  },
  {
    title: "Commodity",
    dataIndex: "commodity",
    width: 150,
    render: (text, record) => (
      <div title="Commodity">
        {text &&
          text
            .map(({ mine_type_detail }) =>
              mine_type_detail
                .map(
                  ({ mine_commodity_code }) =>
                    mine_commodity_code && record.commodityHash[mine_commodity_code]
                )
                .filter(Boolean)
                .join(", ")
            )
            .join(", ")}
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

const transformRowData = (mines, mineIds, mineRegionHash, mineTenureHash, mineCommodityHash) =>
  mineIds.map((id) => ({
    key: id,
    emptyField: Strings.EMPTY_FIELD,
    mineName: mines[id].mine_name ? mines[id].mine_name : Strings.EMPTY_FIELD,
    mineNo: mines[id].mine_no ? mines[id].mine_no : Strings.EMPTY_FIELD,
    operationalStatus: mines[id].mine_status[0]
      ? mines[id].mine_status[0].status_labels[0]
      : Strings.EMPTY_FIELD,
    permit: mines[id].mine_permit[0] ? mines[id].mine_permit : null,
    region: mines[id].mine_region ? mineRegionHash[mines[id].mine_region] : Strings.EMPTY_FIELD,
    commodity: mines[id].mine_type[0] ? mines[id].mine_type : null,
    commodityHash: mineCommodityHash,
    tenure: mines[id].mine_type[0] ? mines[id].mine_type : null,
    tenureHash: mineTenureHash,
    tsf: mines[id].mine_tailings_storage_facilities
      ? mines[id].mine_tailings_storage_facilities.length
      : Strings.EMPTY_FIELD,
    verified_status: mines[id].verified_status,
  }));

const handleTableChange = (updateMineList) => (pagination, filters, sorter) => {
  const params = isEmpty(sorter)
    ? {
        sort_field: undefined,
        sort_dir: undefined,
      }
    : {
        sort_field: sorter.column.sortField,
        sort_dir: sorter.order.replace("end", ""),
      };
  updateMineList(params);
};

const applySortIndicator = (_columns, field, dir) =>
  _columns.map((column) => ({
    ...column,
    sortOrder: column.sortField === field ? dir.concat("end") : false,
  }));

export const MineList = (props) => (
  <TableLoadingWrapper
    condition={props.isLoaded}
    tableHeaders={getTableHeaders(columns)}
    paginationPerPage={props.paginationPerPage}
  >
    <Table
      rowClassName="fade-in"
      align="left"
      pagination={false}
      columns={applySortIndicator(columns, props.sortField, props.sortDir)}
      dataSource={transformRowData(
        props.mines,
        props.mineIds,
        props.mineRegionHash,
        props.mineTenureHash,
        props.mineCommodityOptionsHash
      )}
      locale={{ emptyText: <NullScreen type="no-results" /> }}
      onChange={handleTableChange(props.handleMineSearch)}
    />
  </TableLoadingWrapper>
);

MineList.propTypes = propTypes;
MineList.defaultProps = defaultProps;

export default MineList;
