import React from "react";
import { PropTypes } from "prop-types";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  // eslint-disable-next-line
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  // eslint-disable-next-line
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.importedNOWApplicationReview).isRequired,
};

export const NOWApplicationReviews = (props) => {
  return <div>{props}</div>;
};

NOWApplicationReviews.propTypes = propTypes;

export default NOWApplicationReviews;
