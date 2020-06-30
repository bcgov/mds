import React from "react";
import PropTypes from "prop-types";
import ChangeNOWLocationForm from "@/components/Forms/noticeOfWork/ChangeNOWLocationForm";

const propTypes = {
  values: PropTypes.objectOf(PropTypes.string).isRequired,
  handleNOWImport: PropTypes.func.isRequired,
};

export const VerifyNOWMineInformation = (props) => (
  <div>
    <h4>Verify Mine</h4>
    <p>
      Review the information below to confirm that this Notice of Work belongs with this mine
      record.
    </p>
    <br />
    <p>You can change the mine and/or update the NoW&lsquo;s Longitude and Latitude.</p>
    <br />
    <ChangeNOWLocationForm
      initialValues={props.values}
      onSubmit={props.handleNOWImport}
      title="Confirm Location"
    />
  </div>
);

VerifyNOWMineInformation.propTypes = propTypes;

export default VerifyNOWMineInformation;
