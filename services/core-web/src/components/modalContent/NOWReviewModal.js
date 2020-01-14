import React from "react";
import PropTypes from "prop-types";
import NOWReviewForm from "@/components/Forms/noticeOfWork/NOWReviewForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
};

const defaultProps = {
  title: "",
};

export const NOWReviewModal = (props) => (
  <div>
    <NOWReviewForm {...props} />
  </div>
);

NOWReviewModal.propTypes = propTypes;
NOWReviewModal.defaultProps = defaultProps;
export default NOWReviewModal;
