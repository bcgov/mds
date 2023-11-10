import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownNoticeOfWorkApplicationDocumentTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@common/constants/API";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@/constants/fileTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  now_application_guid: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  isFinalAppPackage: PropTypes.bool.isRequired,
  dropdownNoticeOfWorkApplicationDocumentTypeOptions: PropTypes.arrayOf(
    CustomPropTypes.dropdownListItem
  ).isRequired,
  change: PropTypes.func.isRequired,
  isInCompleteStatus: PropTypes.Bool,
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  categoriesToShow: [],
  isInCompleteStatus: false,
};

export class EditNoticeOfWorkDocumentForm extends Component {
  state = {
    uploadedFiles: [],
    disabled: false,
  };

  toggleDisabled = (value) => {
    this.setState({
      disabled: value,
    });
  };

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState(
      (prevState) => ({
        uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
      }),
      () => this.toggleDisabled(false)
    );
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));

    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    const filteredDropDownOptions = this.props.dropdownNoticeOfWorkApplicationDocumentTypeOptions.filter(
      ({ subType, value }) => {
        if (subType && this.props.categoriesToShow.length > 0) {
          return this.props.categoriesToShow.includes(subType);
        }
        if (this.props.categoriesToShow.length > 0) {
          return this.props.categoriesToShow.includes(value);
        }
        return true;
      }
    );

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            {!this.props.isEditMode && (
              <Form.Item>
                <Field
                  id="now_application_document_type_code"
                  name="now_application_document_type_code"
                  label="Document Category*"
                  placeholder="Select a document type"
                  component={renderConfig.SELECT}
                  data={filteredDropDownOptions}
                  validate={[
                    required,
                    validateSelectOptions(
                      this.props.dropdownNoticeOfWorkApplicationDocumentTypeOptions
                    ),
                  ]}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="description"
                name="description"
                label="Description"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[maxLength(280)]}
              />
            </Form.Item>
            {!this.props.isInCompleteStatus && (
              <Form.Item>
                <Field
                  id="is_final_package"
                  name="is_final_package"
                  label="Part of permit package"
                  type="checkbox"
                  component={renderConfig.CHECKBOX}
                />
              </Form.Item>
            )}
            {this.props.isFinalAppPackage && (
              <>
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item>
                      <Field
                        id="preamble_title"
                        name="preamble_title"
                        label="Title"
                        placeholder="Title"
                        component={renderConfig.FIELD}
                      />
                    </Form.Item>
                  </Col>
                  <Col md={12} xs={24}>
                    <Form.Item>
                      <Field
                        id="preamble_author"
                        name="preamble_author"
                        label="Author"
                        placeholder="Author"
                        component={renderConfig.FIELD}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col md={12} xs={24}>
                    <Form.Item>
                      <Field
                        id="preamble_date"
                        name="preamble_date"
                        label="Date"
                        placeholder="Date"
                        component={renderConfig.DATE}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            {!this.props.isEditMode && (
              <>
                <h5>Document Upload*</h5>
                <p className="p-light">
                  All files uploaded will be classified using the selected Category. To upload other
                  file types, re-open this form after submitting the current files.
                </p>
                <br />
                <Form.Item>
                  <Form.Item>
                    <Field
                      id="notice_of_work_file_upload"
                      name="notice_of_work_file_upload"
                      onFileLoad={this.onFileLoad}
                      onRemoveFile={this.onRemoveFile}
                      component={FileUpload}
                      addFileStart={() => this.toggleDisabled(true)}
                      uploadUrl={NOTICE_OF_WORK_DOCUMENT(this.props.now_application_guid)}
                      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL }}
                      allowMultiple
                      allowRevert
                    />
                  </Form.Item>
                </Form.Item>
              </>
            )}
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
            disabled={
              (this.state.uploadedFiles.length === 0 && !this.props.isEditMode) ||
              this.props.submitting ||
              this.state.disabled
            }
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

EditNoticeOfWorkDocumentForm.propTypes = propTypes;
EditNoticeOfWorkDocumentForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM);

const mapStateToProps = (state) => ({
  isFinalAppPackage: selector(state, "is_final_package"),
  dropdownNoticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
    state
  ),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM),
  })
)(EditNoticeOfWorkDocumentForm);
