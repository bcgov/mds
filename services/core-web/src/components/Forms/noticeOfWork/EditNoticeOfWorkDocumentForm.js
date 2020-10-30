import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getDropdownNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@common/constants/API";
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
  dropdownNoticeOfWorkApplicationDocumentTypeOptions: PropTypes.arrayOf(
    CustomPropTypes.dropdownListItem
  ).isRequired,
  change: PropTypes.func.isRequired,
  categoriesToShow: PropTypes.arrayOf(PropTypes.string),
  document_manager_guid: PropTypes.string,
};

const defaultProps = {
  categoriesToShow: [],
  document_manager_guid: "",
};

export const EditNoticeOfWorkDocumentForm = (props) => {
  const filteredDropDownOptions = props.dropdownNoticeOfWorkApplicationDocumentTypeOptions.filter(
    ({ value }) =>
      props.categoriesToShow.length > 0 ? props.categoriesToShow.includes(value) : value
  );
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
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
                validateSelectOptions(props.dropdownNoticeOfWorkApplicationDocumentTypeOptions),
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Description"
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[maxLength(280)]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="is_final_package"
              name="is_final_package"
              label="Part of final application package"
              type="checkbox"
              component={renderConfig.CHECKBOX}
            />
          </Form.Item>
          <h5>Document Upload*</h5>
          <p className="p-light">
            All files uploaded will be classified using the selected Category. To upload other file
            types, re-open this form after submitting the current files.
          </p>
          <br />
          <Form.Item>
            <Form.Item>
              <Field
                id="notice_of_work_file_upload"
                name="notice_of_work_file_upload"
                onFileLoad={(document_name, document_manager_guid) => {
                  props.change("document_manager_guid", document_manager_guid);
                  props.change("document_name", document_name);
                }}
                component={FileUpload}
                uploadUrl={NOTICE_OF_WORK_DOCUMENT(props.now_application_guid)}
                allowMultiple
                allowRevert
              />
            </Form.Item>
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
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
          loading={props.submitting}
          disabled={!props.document_manager_guid}
        >
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

EditNoticeOfWorkDocumentForm.propTypes = propTypes;
EditNoticeOfWorkDocumentForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM);
export default compose(
  connect((state) => ({
    dropdownNoticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
      state
    ),
    document_manager_guid: selector(state, "document_manager_guid"),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM),
  })
)(EditNoticeOfWorkDocumentForm);
