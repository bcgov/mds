/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import { connect } from "react-redux";
import { formatDate } from "@common/utils/helpers";
import {
  getBondTypeOptionsHash,
  getBondStatusOptionsHash,
} from "@common/selectors/staticContentSelectors";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import Address from "@/components/common/Address";
import { formatMoney } from "@common/utils/helpers";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  provinceOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  permitGuid: PropTypes.string.isRequired,
};

export const ViewBondModal = (props) => {
  const address = {
    address_line_1: props.bond.institution_street,
    city: props.bond.institution_city,
    sub_division_code: props.bond.institution_province,
    post_code: props.bond.institution_postal_code,
  };
  return (
    <div>
      <div className="inline-flex between block-tablet">
        <div className="flex-tablet">
          <p className="field-title">Amount</p>
          <p>{formatMoney(props.bond.amount) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="flex-tablet">
          <p className="field-title">Status</p>
          <p>{props.statusTypeOptionsHash[props.bond.bond_status_code] || Strings.EMPTY_FIELD}</p>
        </div>
      </div>
      <br />
      <div className="content--light-grey padding-small">
        <div className="inline-flex padding-small">
          <p className="field-title">Payment Type</p>
          <p>{props.bondTypeOptionsHash[props.bond.bond_type_code] || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Issue Date</p>
          <p>{formatDate(props.bond.issue_date) || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Payer</p>
          <p>{props.bond.payer.name || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Reference Number</p>
          <p>{props.bond.reference_number || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Institution Name</p>
          <p>{props.bond.institution_name || Strings.EMPTY_FIELD}</p>
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Institution Location</p>
          <Address address={address} />
        </div>
        <div className="inline-flex padding-small">
          <p className="field-title">Notes</p>
          <p>{props.bond.note || Strings.EMPTY_FIELD}</p>
        </div>
      </div>
      <br />
      <div className="right center-mobile">
        <Button className="full-mobile" type="secondary" onClick={props.closeModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

ViewBondModal.propTypes = propTypes;

const mapStateToProps = (state) => ({
  bondTypeOptionsHash: getBondTypeOptionsHash(state),
  statusTypeOptionsHash: getBondStatusOptionsHash(state),
});

export default connect(mapStateToProps)(ViewBondModal);
