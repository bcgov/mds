import React from "react";
import PropTypes from "prop-types";
import AddReportForm from "@/components/Forms/reports/AddReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddReportModal = (props) => (
  <div>
    <AddReportForm {...props} />
  </div>
);

AddReportModal.propTypes = propTypes;
AddReportModal.defaultProps = defaultProps;
export default AddReportModal;
