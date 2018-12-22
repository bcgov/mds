import React from "react";
import PropTypes from "prop-types";
import AddTailingsReportForm from "@/components/Forms/AddTailingsReportForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  mineTSFRequiredReportsDropDown: PropTypes.array.isRequired,
};

const defaultProps = {
  title: "",
};

export const AddTailingsReportModal = (props) => (
    <div>
      <AddTailingsReportForm {...props} />
    </div>
  );

AddTailingsReportModal.propTypes = propTypes;
AddTailingsReportModal.defaultProps = defaultProps;
export default AddTailingsReportModal;
