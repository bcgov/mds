import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { remove } from "lodash";
import { bindActionCreators } from "redux";
import { Col, Row, Popconfirm, Typography } from "antd";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Field, FieldArray, change, formValueSelector, arrayPush } from "redux-form";
import { required } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import { TRASHCAN } from "@/constants/assets";
import * as FORM from "@/constants/forms";
import ExplosivesPermitFileUpload from "@/components/Forms/ExplosivesPermit/ExplosivesPermitFileUpload";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  documents: PropTypes.arrayOf(CustomPropTypes.mineDocument).isRequired,
  categories: PropTypes.arrayOf(CustomPropTypes.options).isRequired,
  isProcessed: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired,
  arrayPush: PropTypes.func.isRequired,
  infoText: PropTypes.string,
};

export class DocumentCategoryForm extends Component {
  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.props.arrayPush(FORM.EXPLOSIVES_PERMIT, "documents", {
      document_name: fileName,
      document_manager_guid,
    });
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change(FORM.EXPLOSIVES_PERMIT, "documents", this.props.documents);
  };

  DocumentCategories = ({ fields }) => {
    return (
      <>
        {fields.map((field, index) => {
          const documentExists = fields.get(index) && fields.get(index).mine_document_guid;
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className="padding-sm margin-small" key={index}>
              <Row gutter={16}>
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
                      data={this.props.categories}
                      validate={[required]}
                      disabled={documentExists && this.props.isProcessed}
                    />
                  </Form.Item>
                </Col>
                <Col span={4} className="right">
                  {documentExists && !this.props.isProcessed && (
                    <Popconfirm
                      placement="top"
                      title={[
                        <p key={index}>Are you sure you want to remove this file?</p>,
                        <p key={index}>This cannot be undone.</p>,
                      ]}
                      okText="Yes"
                      cancelText="No"
                      onConfirm={() => {
                        fields.remove(index);
                      }}
                    >
                      <button ghost type="button">
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

  render() {
    return (
      <div className="document-container">
        <Form.Item label="Select Files/Upload files*">
          <div className="inputs">
            <FieldArray name="documents" component={this.DocumentCategories} />
          </div>
          <Typography.Text>{this.props.infoText}</Typography.Text>
          <Field
            id="DocumentFileUpload"
            name="DocumentFileUpload"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            mineGuid={this.props.mineGuid}
            component={ExplosivesPermitFileUpload}
            allowMultiple
          />
        </Form.Item>
      </div>
    );
  }
}

DocumentCategoryForm.propTypes = propTypes;

const selector = formValueSelector(FORM.EXPLOSIVES_PERMIT);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentCategoryForm);
