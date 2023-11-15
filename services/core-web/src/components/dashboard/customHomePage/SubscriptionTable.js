import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Popconfirm, Tooltip } from "antd";
import { uniqBy, flattenDeep } from "lodash";
import * as Strings from "@mds/common/constants/strings";
import * as router from "@/constants/routes";
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
      permit:
        mine.mine_permit_numbers && mine.mine_permit_numbers.length > 0
          ? mine.mine_permit_numbers
          : [],
      region: mine.mine_region ? mineRegionHash[mine.mine_region] : Strings.EMPTY_FIELD,
      commodity:
        mine.mine_type && mine.mine_type.detail && mine.mine_type.detail.length > 0
          ? uniqBy(
              flattenDeep(
                mine.mine_type.map(
                  (type) =>
                    type.mine_type_detail &&
                    type.mine_type_detail.length > 0 &&
                    type.mine_type_detail
                      .filter((detail) => detail.mine_commodity_code)
                      .map((detail) => mineCommodityHash[detail.mine_commodity_code])
                )
              )
            )
          : [],
      commodityHash: mineCommodityHash,
      tenure:
        mine.mine_type && mine.mine_type.length > 0
          ? uniqBy(mine.mine_type.map((type) => mineTenureHash[type.mine_tenure_type_code]))
          : [],
      tenureHash: mineTenureHash,
      tsf: mine.mine_tailings_storage_facilities
        ? mine.mine_tailings_storage_facilities.length
        : Strings.EMPTY_FIELD,
    }));

  render() {
    const columns = [
      {
        title: "Name",
        key: "mineName",
        dataIndex: "mineName",
        render: (text, record) => (
          <div title="Name">
            <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
          </div>
        ),
      },
      {
        title: "Number",
        key: "mineNo",
        dataIndex: "mineNo",
        render: (text) => <div title="Number">{text}</div>,
      },
      {
        title: "Operational Status",
        key: "operationalStatus",
        dataIndex: "operationalStatus",
        render: (text) => <div title="Operational Status">{text}</div>,
      },
      {
        title: "Permits",
        key: "permit",
        dataIndex: "permit",
        render: (text, record) => (
          <div title="Permits">
            <ul className="mine-list__permits">
              {text && text.map((permit_no) => <li key={permit_no}>{permit_no}</li>)}
              {!text && <li>{record.emptyField}</li>}
            </ul>
          </div>
        ),
      },
      {
        title: "Region",
        key: "region",
        dataIndex: "region",
        render: (text) => <div title="Region">{text}</div>,
      },
      {
        title: "Tenure",
        key: "tenure",
        dataIndex: "tenure",
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
        render: (text) => <div title="TSF">{text}</div>,
      },
      {
        title: "",
        key: "unsubscribe",
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
      />
    );
  }
}

SubscriptionTable.propTypes = propTypes;

export default SubscriptionTable;
