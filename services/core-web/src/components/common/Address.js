import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon } from "antd";
import { formatPostalCode } from "@common/utils/helpers";
import * as Strings from "@common/constants/strings";

const propTypes = {
  address: PropTypes.objectOf(PropTypes.string).isRequired,
};

/**
 * @constant Address- reusable component that formats any given address object
 */

export class Address extends Component {
  addressContainsTruthyValues = (object) =>
    // address_type_code is always "CAD" && if "suite_no" exists but nothing else, this field isn't helpful
    Object.keys(object)
      .filter((key) => key !== "address_type_code" && key !== "suite_no")
      .some((key) => object[key]);

  formatRowContent = (itemArr) =>
    itemArr
      .filter((item) => item)
      .map((item, i) => <span key={item}>{i !== itemArr.length - 1 ? `${item} ` : item}</span>);

  renderRowOne = (itemArr) => (
    <div className="inline-flex">
      <div>
        <Icon type="contacts" className="icon-sm" />
      </div>
      <p>{this.formatRowContent(itemArr)}</p>
    </div>
  );

  renderNextLine = (itemArr) => (
    <div className="padding-large--left">
      <p>{this.formatRowContent(itemArr)}</p>
    </div>
  );

  // since nothing in the address object is required, users can fill out 1 or more fields.
  // the following check tests all the edge cases, and formats the address into a 1-3 line section, with an Icon on line 1.
  renderAddress = (address) => (
    <div>
      {address.address_line_1 && this.renderRowOne([address.suite_no, address.address_line_1])}
      {!address.address_line_1 && address.address_line_2
        ? this.renderRowOne([address.suite_no, address.address_line_2])
        : this.renderNextLine([address.address_line_2])}
      {!address.address_line_1 &&
      !address.address_line_2 &&
      (address.city || address.sub_division_code || address.post_code)
        ? this.renderRowOne([
            address.city,
            address.sub_division_code,
            formatPostalCode(address.post_code),
          ])
        : this.renderNextLine([
            address.city,
            address.sub_division_code,
            formatPostalCode(address.post_code),
          ])}
    </div>
  );

  render() {
    return (
      <div style={{ minHeight: "70px" }}>
        {this.addressContainsTruthyValues(this.props.address)
          ? this.renderAddress(this.props.address)
          : this.renderRowOne([Strings.EMPTY_FIELD])}
      </div>
    );
  }
}

Address.propTypes = propTypes;

export default Address;
