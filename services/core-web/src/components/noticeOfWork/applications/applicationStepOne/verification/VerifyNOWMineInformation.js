/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import ChangeNOWLocationForm from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";

const propTypes = {
  values: PropTypes.objectOf(PropTypes.string).isRequired,
  handleNOWImport: PropTypes.func.isRequired,
};

export class VerifyNOWMineInformation extends Component {
  render() {
    return (
      <div>
        <h4>Verify Mine</h4>
        <p>
          Review the information below and verify that the mine associated with this notice of work
          is correct.
        </p>
        <br />
        <p>
          Use the form below to move the NoW to a different mine, and/or update the Longitude and
          Latitude from the NoW.
        </p>
        <br />
        <ChangeNOWLocationForm
          initialValues={this.props.values}
          onSubmit={this.props.handleNOWImport}
          title="Confirm Location"
        />
      </div>
    );
  }
}
VerifyNOWMineInformation.propTypes = propTypes;

export default VerifyNOWMineInformation;
