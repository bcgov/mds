/* eslint-disable no-unused-vars */

import React, { Component } from "react";
import * as router from "@/constants/routes";
import PropTypes from "prop-types";
import { Link, StaticRouter } from "react-router-dom";
import { Button, Tag } from "antd";
import * as String from "@/constants/strings";

const propTypes = {
  basicMineInfo: PropTypes.objectOf(PropTypes.any),
  mineCommodityHash: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  basicMineInfo: {},
  mineCommodityHash: {},
};

// FIXME: For some reason, this component requires this.context, preventing it
// from being refactored into a pure function
// eslint-disable-next-line react/prefer-stateless-function
export class MapPopup extends Component {
  render() {
    const id = this.props.basicMineInfo.guid;
    const permit_array = this.props.basicMineInfo.mine_permit;
    const mine_types = this.props.basicMineInfo.mine_type;
    const commoditySet = new Set();
    if (mine_types) {
      mine_types.forEach((mine_type) => {
        mine_type.mine_type_detail.forEach((detail) => {
          if (detail.mine_commodity_code) {
            commoditySet.add(this.props.mineCommodityHash[detail.mine_commodity_code]);
          }
        });
      });
    }
    const commodity_list = Array.from(commoditySet);
    const commodity_string = commodity_list.length > 0 ? commodity_list.join(", ") : "N/A";

    let permits = "";
    // if (permit_array) {
    //   permits = permit_array
    //     .filter((permit) => permit.permit_status_code === "O")
    //     .map((permit) => <li key={permit.permit_guid}> {permit.permit_no} </li>);
    // }
    // permits = permits.length > 0 ? permits : <li>N/A</li>;

    const permit_set = new Set();
    if (permit_array) {
      permit_array.forEach((permit) => {
        if (permit.permit_status_code === "O") {
          permit_set.add(permit.permit_no);
        }
      });
    }
    const open_permit_arrray = Array.from(permit_set);
    permits = open_permit_arrray.length > 0 ? open_permit_arrray.join(", ") : "N/A";

    return (
      <div>
        {/* <div className="inline-flex padding-small wrap">
          <p className="field-title">Commodity</p>
          {commodity_list.length > 0 ? (
            commodity_list.map((code) => <Tag key={code}>{code}</Tag>)
          ) : (
            <p>{String.EMPTY_FIELD}</p>
          )}
        </div> */}

        <table className="minePopUpText" style={{ width: "100%" }}>
          <tr>
            <td className="field-title">Mine No.</td>
            <td>{this.props.basicMineInfo.mine_no}</td>
            <td style={{ textAlign: "right" }}>
              <StaticRouter context={this.context} basename={process.env.BASE_PATH}>
                <Link to={router.MINE_SUMMARY.dynamicRoute(id)}>
                  <Button type="primary">View Mine</Button>
                </Link>
              </StaticRouter>
            </td>
          </tr>

          <tr>
            <td className="field-title">Permit No.</td>
            <td>
              {open_permit_arrray.length > 0
                ? open_permit_arrray.map((permit) => <Tag key={permit}>{permit}</Tag>)
                : String.EMPTY_FIELD}
            </td>
            <td />
          </tr>
          <tr>
            <td className="field-title">Commodities</td>
            <td>
              {commodity_list.length > 0
                ? commodity_list.map((code) => <Tag key={code}>{code}</Tag>)
                : String.EMPTY_FIELD}
            </td>
            <td />
          </tr>
          {/* <tr>
            <td className="field-title">Permit No.</td>
            <td>{permits}</td>
            <td>7 of 10 results shown</td>
          </tr>
          <tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Commodity</td>
            <td>{commodity_string}</td>
            <td>7 of 10 results shown</td>
          </tr> */}
        </table>
      </div>
    );
  }
}

MapPopup.propTypes = propTypes;
MapPopup.defaultProps = defaultProps;

export default MapPopup;
