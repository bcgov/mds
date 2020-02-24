import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Popconfirm, Tooltip } from "antd";
import * as Strings from "@common/constants/strings";
import * as router from "@/constants/routes";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import CoreTable from "@/components/common/CoreTable";
import { UNSUBSCRIBE } from "@/constants/assets";

/**
 * @class SubscriptionTable is a user specific table of mines they have subscribed to with the ability to unsubscribe
 *
 */

const propTypes = {
  handleUnSubscribe: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineTenureHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineCommodityOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoaded: PropTypes.bool.isRequired,
};

export class SubscriptionTable extends Component {
  transformRowData = (mines, mineRegionHash, mineTenureHash, mineCommodityHash) =>
    mines.map((mine) => ({
      key: mine.mine_guid,
      emptyField: Strings.EMPTY_FIELD,
      mineName: mine.mine_name || Strings.EMPTY_FIELD,
      mineNo: mine.mine_no || Strings.EMPTY_FIELD,
      operationalStatus: mine.mine_status.length
        ? mine.mine_status[0].status_labels[0]
        : Strings.EMPTY_FIELD,
      permit: mine.mine_permit_numbers.length ? mine.mine_permit_numbers : null,
      region: mine.region_code ? mineRegionHash[mine.region_code] : Strings.EMPTY_FIELD,
      commodity: mine.mine_type.length ? mine.mine_type : null,
      commodityHash: mineCommodityHash,
      tenure: mine.mine_type.length ? mine.mine_type : null,
      tenureHash: mineTenureHash,
      tsf: mine.mine_tailings_storage_facility
        ? mine.mine_tailings_storage_facility.length
        : Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "Mine Name",
        dataIndex: "mineName",
        render: (text, record) => (
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
        ),
      },
      {
        title: "Mine No.",
        dataIndex: "mineNo",
        render: (text) => <div title="Mine Number">{text}</div>,
      },
      {
        title: "Operational Status",
        dataIndex: "operationalStatus",
        render: (text) => <div title="Operational Status">{text}</div>,
      },
      {
        title: "Permit No.",
        dataIndex: "permit",
        render: (text, record) => (
          <div title="Permit Number">
            <ul className="mine-list__permits">
              {text && text.map((permit_no) => <li key={permit_no}>{permit_no}</li>)}
              {!text && <li>{record.emptyField}</li>}
            </ul>
          </div>
        ),
      },
      {
        title: "Region",
        dataIndex: "region",
        render: (text, record) => (
          <div title="Region">
            {text}
            {!text && <div>{record.emptyField}</div>}
          </div>
        ),
      },
      {
        title: "Tenure",
        dataIndex: "tenure",
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
        render: (text, record) => (
          <div title="Commodity">
            {text &&
              text.map(({ mine_type_detail, mine_type_guid }) => (
                <div key={mine_type_guid}>
                  {mine_type_detail.map(({ mine_commodity_code, mine_type_detail_guid }) => (
                    <span key={mine_type_detail_guid}>
                      {mine_commodity_code && `${record.commodityHash[mine_commodity_code]},`}
                    </span>
                  ))}
                </div>
              ))}
          </div>
        ),
      },
      {
        title: "TSF",
        dataIndex: "tsf",
        render: (text) => <div title="TSF">{text}</div>,
      },
      {
        title: "",
        dataIndex: "",
        render: (text, record) => (
          <Popconfirm
            placement="left"
            title={`Are you sure you want to unsubscribe from ${record.mineName}?`}
            okText="Yes"
            cancelText="No"
            onConfirm={(event) => this.props.handleUnSubscribe(event, record.key, record.mineName)}
          >
            <Tooltip title="Unsubscribe" placement="right">
              <button type="button">
                <img alt="document" src={UNSUBSCRIBE} />
              </button>
            </Tooltip>
          </Popconfirm>
        ),
      },
    ];

    return (
      <CoreTable
        condition={this.props.isLoaded}
        columns={columns}
        dataSource={this.transformRowData(
          this.props.subscribedMines,
          this.props.mineRegionHash,
          this.props.mineTenureHash,
          this.props.mineCommodityOptionsHash
        )}
        tableProps={{
          align: "left",
          pagination: false,
          locale: { emptyText: <NullScreen type="subscription" /> },
        }}
      />
    );
  }
}

SubscriptionTable.propTypes = propTypes;

export default SubscriptionTable;
