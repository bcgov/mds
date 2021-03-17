import React from "react";
import PropTypes from "prop-types";
import Highlight from "react-highlighter";
import AdministrativeAmendmentForm from "@/components/Forms/noticeOfWork/AdministrativeAmendmentForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {};

export const AddAdministrativeAmendmentModal = (props) => (
  <div>
    <p>
      Creating an <Highlight search="Administrative Amendment">Administrative Amendment</Highlight>{" "}
      allows you to update/change the selected permit amendment.
    </p>
    <br />
    <AdministrativeAmendmentForm {...props} />
  </div>
);

AddAdministrativeAmendmentModal.propTypes = propTypes;
AddAdministrativeAmendmentModal.defaultProps = defaultProps;

export default AddAdministrativeAmendmentModal;
