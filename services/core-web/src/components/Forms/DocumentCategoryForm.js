/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Field, reduxForm, change, formValueSelector, FormSection } from "redux-form";
import { CloseOutlined } from "@ant-design/icons";
import { required, maxLength, dateNotInFuture, number, lat, lon } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
  categories: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
};

export const DocumentCategoryForm = (props) => {
  return (
    <div>
      <FormSection name="documents">
        {props.documents?.map((file) => (
          <div className="padding-sm margin-small" key={file.permit_amendment_document_guid}>
            <Row gutter={48}>
              <Col span={12}>
                <Form.Item>
                  <Field
                    id="document_name"
                    name="document_name"
                    label="Document Name"
                    validate={[required]}
                    disable
                    component={renderConfig.FIELD}
                  />
                </Form.Item>
              </Col>
              <Col md={12} sm={24}>
                <Form.Item>
                  <Field
                    id="code"
                    name="code"
                    placeholder="Select a Document Category"
                    label="Document Category*"
                    component={renderConfig.SELECT}
                    data={props.categories}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row className="padding-sm">
              <Col span={21}>
                <p className="uploaded-file left">{file.document_name}</p>
              </Col>
              <Col span={3} className="right">
                <Popconfirm
                  placement="top"
                  title={[
                    <p>Are you sure you want to remove this file?</p>,
                    <p>This cannot be undone.</p>,
                  ]}
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    console.log("we're doing something here");
                  }}
                >
                  <button type="button">
                    <CloseOutlined />
                  </button>
                </Popconfirm>
              </Col>
            </Row>
          </div>
        ))}
      </FormSection>
    </div>
  );
};

DocumentCategoryForm.propTypes = propTypes;

export default DocumentCategoryForm;
