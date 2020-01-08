import React from "react";
import PropTypes from "prop-types";
import AddNOWReviewForm from "@/components/Forms/noticeOfWork/AddNOWReviewForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const AddNOWReviewModal = (props) => (
  <div>
    <AddNOWReviewForm {...props} />
  </div>
);

AddNOWReviewModal.propTypes = propTypes;
AddNOWReviewModal.defaultProps = defaultProps;
export default AddNOWReviewModal;
