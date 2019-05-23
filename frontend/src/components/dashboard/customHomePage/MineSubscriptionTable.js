import React, { Component } from "react";
import PropTypes, { objectOf, string } from "prop-types";
import { Link } from "react-router-dom";
import { Table, Popconfirm } from "antd";
import { uniqBy } from "lodash";
import * as router from "@/constants/routes";
import * as Strings from "@/constants/strings";
import NullScreen from "@/components/common/NullScreen";
import CustomPropTypes from "@/customPropTypes";
import { UNSUBSCRIBE } from "@/constants/assets";

/**
 * @class MineSubscriptionTable is the main landing page of the application
 *
 */

const propTypes = {
  handleUnSubscribe: PropTypes.func.isRequired,
  subscribedMines: PropTypes.arrayOf(CustomPropTypes.mine).isRequired,
  mineRegionHash: objectOf(string).isRequired,
  mineTenureHash: objectOf(string).isRequired,
  mineCommodityOptionsHash: objectOf(string).isRequired,
};

export class MineSubscriptionTable extends Component {
  transformRowData = (mines, mineRegionHash, mineTenureHash, mineCommodityHash) =>
    mines.map((mine) => ({
      key: mine.mine_guid,
      emptyField: Strings.EMPTY_FIELD,
      mineName: mine.mine_name || Strings.EMPTY_FIELD,
      mineNo: mine.mine_no || Strings.EMPTY_FIELD,
      operationalStatus: mine.mine_status.length
        ? mine.mine_status[0].status_labels[0]
        : Strings.EMPTY_FIELD,
      permit: mine.mine_permit.length ? mine.mine_permit : null,
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
        width: 200,
        dataIndex: "mineName",
        render: (text, record) => (
          <Link to={router.MINE_SUMMARY.dynamicRoute(record.key)}>{text}</Link>
        ),
      },
      {
        title: "Mine No.",
        width: 100,
        dataIndex: "mineNo",
        render: (text) => <div title="Mine Number">{text}</div>,
      },
      {
        title: "Operational Status",
        width: 150,
        dataIndex: "operationalStatus",
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
        width: 150,
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
        width: 150,
        render: (text) => <div title="TSF">{text}</div>,
      },
      {
        title: "",
        dataIndex: "",
        width: 150,
        render: (text, record) => (
          <Popconfirm
            placement="top"
            title={`Are you sure you want to unsubscribe from ${record.mineName}?`}
            okText="Yes"
            cancelText="No"
            onConfirm={(event) => this.props.handleUnSubscribe(event, record.key)}
          >
            <button type="button">
              <img alt="document" src={UNSUBSCRIBE} />
            </button>
          </Popconfirm>
        ),
      },
    ];
    return (
      <div className="tab__content">
        <h4>Subscribed Mines</h4>
        <Table
          align="left"
          pagination={false}
          columns={columns}
          dataSource={this.transformRowData(
            this.props.subscribedMines,
            this.props.mineRegionHash,
            this.props.mineTenureHash,
            this.props.mineCommodityOptionsHash
          )}
          locale={{ emptyText: <NullScreen type="subscription" /> }}
        />
      </div>
    );
  }
}

MineSubscriptionTable.propTypes = propTypes;

export default MineSubscriptionTable;
