import React from "react";
import PropTypes from "prop-types";
import EditFullPartyForm from "@/components/Forms/parties/EditFullPartyForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const EditPartyModal = (props) => (
  <div>
    <EditFullPartyForm {...props} />
  </div>
);

EditPartyModal.propTypes = propTypes;
EditPartyModal.defaultProps = defaultProps;
export default EditPartyModal;
