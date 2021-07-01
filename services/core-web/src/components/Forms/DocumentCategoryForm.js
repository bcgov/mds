/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Popconfirm, Button } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Field, FieldArray } from "redux-form";
import { required, maxLength, dateNotInFuture, number, lat, lon } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import { TRASHCAN } from "@/constants/assets";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
  categories: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
};

export const DocumentCategoryForm = (props) => {
  const DocumentCategories = ({ fields }) => {
    return (
      <>
        {fields.map((field, index) => {
          // const documentExists = fields.get(index) && fields.get(index).mine_document_guid;
          return (
            <div className="padding-sm margin-small" key={index}>
              <Row gutter={48}>
                <Col span={10}>
                  <Form.Item>
                    <Field
                      id={`${field}document_name`}
                      name={`${field}document_name`}
                      label="Document Name*"
                      validate={[required]}
                      disabled
                      component={renderConfig.FIELD}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  <Form.Item>
                    <Field
                      id={`${field}explosives_permit_document_type_code`}
                      name={`${field}explosives_permit_document_type_code`}
                      placeholder="Select a Document Category"
                      label="Document Category*"
                      component={renderConfig.SELECT}
                      data={props.categories}
                      validate={[required]}
                    />
                  </Form.Item>
                </Col>
                <Col span={4} className="right">
                  {true && (
                    <Popconfirm
                      placement="top"
                      title={[
                        <p>Are you sure you want to remove this file?</p>,
                        <p>This cannot be undone.</p>,
                      ]}
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        fields.remove(index);
                      }}
                    >
                      <button ghost>
                        <img name="remove" src={TRASHCAN} alt="Remove Document" />
                      </button>
                    </Popconfirm>
                  )}
                </Col>
              </Row>
            </div>
          );
        })}
      </>
    );
  };
  return (
    <div>
      <FieldArray name="documents" component={DocumentCategories} />
    </div>
  );
};

DocumentCategoryForm.propTypes = propTypes;

export default DocumentCategoryForm;
