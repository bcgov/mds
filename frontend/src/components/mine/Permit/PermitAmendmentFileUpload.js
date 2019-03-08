import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm, Tabs } from "antd";

import { PERMIT } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const PermitAmendmentFileUpload = (props) => (
  <Form.Item>
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={`${PERMIT()}/amendments/documents?mine_guid=${props.mineGuid}`}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
      onFileLoad={props.onFileLoad}
    />
  </Form.Item>
);

PermitAmendmentFileUpload.propTypes = propTypes;

export default PermitAmendmentFileUpload;
