import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link, StaticRouter } from "react-router-dom";
import { Button, Tag } from "antd";
import * as router from "@/constants/routes";
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
// Aditional note: The content from this is being passed to the arcgis pure javascript component as static HTML content.
// this.context is being used to generate a pure HTML link due to either constraint or complexity in having arcgis trigger
// a route event.

// eslint-disable-next-line react/prefer-stateless-function
export class MapPopup extends Component {
  render() {
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
    const commodity_list_length = commodity_list.length;
    const max_number_displayed = 3;
    const commodity =
      commodity_list_length > 0
        ? commodity_list.slice(0, max_number_displayed).map((code) => <Tag key={code}>{code}</Tag>)
        : String.EMPTY_FIELD;

    const permit_set = new Set();
    if (permit_array) {
      permit_array.forEach((permit) => {
        if (permit.permit_status_code === "O") {
          permit_set.add(permit.permit_no);
        }
      });
    }
    const open_permit_arrray = Array.from(permit_set);
    const permit_list_length = open_permit_arrray.length;

    const permits =
      open_permit_arrray.length > 0
        ? open_permit_arrray.splice(0, max_number_displayed).join(", ")
        : String.EMPTY_FIELD;

    return (
      <div>
        <table className="minePopUpText" style={{ width: "100%" }}>
          <tr>
            <td className="leftMapPopUpCol field-title">Mine No.</td>
            <td>{this.props.basicMineInfo.mine_no}</td>
          </tr>

          <tr>
            <td className="leftMapPopUpCol field-title">Permit No.</td>
            <td>
              {permits}
              <br />
              {permit_list_length > max_number_displayed
                ? `showing ${max_number_displayed} of ${permit_list_length}`
                : null}
            </td>
          </tr>
          <tr>
            <td className="leftMapPopUpCol field-title">Commodities</td>
            <td>
              {commodity}
              <br />
              {commodity_list_length > max_number_displayed
                ? `showing ${max_number_displayed} of ${commodity_list_length}`
                : null}
            </td>
          </tr>
        </table>
        <StaticRouter context={this.context} basename={process.env.BASE_PATH}>
          <Link to={router.MINE_SUMMARY.dynamicRoute(this.props.basicMineInfo.mine_guid)}>
            <div className="mineMapPopUpButton">
              <Button type="primary">View Mine</Button>
            </div>
          </Link>
        </StaticRouter>
      </div>
    );
  }
}

MapPopup.propTypes = propTypes;
MapPopup.defaultProps = defaultProps;

export default MapPopup;
