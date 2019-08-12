import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form, Divider, Button } from "antd";
import { concat, reject } from "lodash";
import { ReportsUploadedFilesList } from "@/components/Forms/reports/ReportsUploadedFilesList";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {
  mineReportComments: [],
};

export const ReportComments = (props) => {
  const hasComments = props.mineReportComments.length > 0;
  return [
    <Divider orientation="left">
      <h5>Comments</h5>
    </Divider>,
  ];
};

ReportComments.propTypes = propTypes;
ReportComments.defaultProps = defaultProps;

export default ReportSubmissions;
