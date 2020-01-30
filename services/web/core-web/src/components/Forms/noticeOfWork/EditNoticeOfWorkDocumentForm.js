import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength } from "@common/utils/Validate";
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
};

export const EditNoticeOfWorkDocumentForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="now_application_document_type_code"
            name="now_application_document_type_code"
            label="Document type*"
            placeholder="Select a document type"
            component={renderConfig.SELECT}
            data={props.dropdownNoticeOfWorkApplicationDocumentTypeOptions}
            validate={[required]}
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
              allowMultiple={false}
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
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

EditNoticeOfWorkDocumentForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    dropdownNoticeOfWorkApplicationDocumentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(
      state
    ),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_NOTICE_OF_WORK_DOCUMENT_FORM),
  })
)(EditNoticeOfWorkDocumentForm);
