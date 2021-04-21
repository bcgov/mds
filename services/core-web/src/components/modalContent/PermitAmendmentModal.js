import React from "react";
import PropTypes from "prop-types";
import PermitAmendmentForm from "@/components/Forms/PermitAmendmentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
  title: PropTypes.string,
  mine_guid: PropTypes.string.isRequired,
  is_historical_amendment: PropTypes.bool,
};

const defaultProps = {
  title: "",
  is_historical_amendment: false,
};

export const PermitAmendmentModal = (props) => (
  <div>
    <PermitAmendmentForm {...props} />
  </div>
);

PermitAmendmentModal.propTypes = propTypes;
PermitAmendmentModal.defaultProps = defaultProps;

export default PermitAmendmentModal;
