import React from "react";
import { PropTypes } from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, FormSection, formValueSelector } from "redux-form";
import { Form, Divider, Row, Col } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.importedNOWApplicationReview),
};

export const NOWApplicationReviews = (props) => {
  return <div>HELPS</div>;
};

NOWApplicationReviews.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);

export default NOWApplicationReviews;
