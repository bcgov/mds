import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm, formValueSelector } from "redux-form";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import RenderDate from "@/components/common/RenderDate";
import { Form, Button, Col, Row, Popconfirm, Tabs } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import { getDropdownPermitStatusOptions } from "@/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  permitTypeCode: PropTypes.string,
  permitActivityTypeCode: PropTypes.string,
};

const defaultProps = {
  permitTypeCode: "",
  permitActivityTypeCode: "",
};

const permitTypes = [
  {
    label: "Coal",
    value: "C",
  },
  {
    label: "Mineral",
    value: "M",
  },
  {
    label: "Placer",
    value: "P",
  },
  {
    label: "Sand & Gravel",
    value: "G",
  },
  {
    label: "Quarry",
    value: "Q",
  },
];

const permitActivityTypes = [
  {
    label: "Operation",
    value: "",
  },
  {
    label: "Exploration",
    value: "X",
  },
];

const selector = formValueSelector(FORM.ADD_PERMIT);
const { TabPane } = Tabs;

const validate = (values) => {
  const errors = {};
  if (
    values.permit_activity_type === "X" &&
    !(values.permit_type === "C" || values.permit_type === "M")
  ) {
    errors.permit_activity_type = "Exploration activity is only valid for Coal and Placer permits";
  }
  return errors;
};

export const AddPermitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Tabs
      defaultActiveKey="1"
      onChange={(activeKey) => {
        // validate
      }}
      style={{ marginTop: "-30px" }}
    >
      <TabPane tab="Permit Info" key="1">
        <br />
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="permit_type"
                name="permit_type"
                label="Permit type*"
                placeholder="Select a permit type"
                component={RenderSelect}
                validate={[required]}
                data={permitTypes}
              />
            </Form.Item>
            {(props.permitTypeCode === "C" ||
              props.permitTypeCode === "M" ||
              props.permitActivityTypeCode === "X") && (
              <Form.Item>
                <Field
                  id="permit activity type*"
                  name="permit_activity_type"
                  label="Permit activity type*"
                  placeholder="Select a permit activity type"
                  component={RenderSelect}
                  data={permitActivityTypes}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="permit_no"
                name="permit_no"
                label="Permit number*"
                component={RenderField}
                validate={[required]}
                inlineLabel={
                  props.permitTypeCode && `${props.permitTypeCode}${props.permitActivityTypeCode} -`
                }
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="permit_status_code"
                name="permit_status_code"
                label="Permit status*"
                placeholder="Select a permit status"
                component={RenderSelect}
                data={props.permitStatusOptions}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={RenderDate}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
      </TabPane>
    </Tabs>
    <br />
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
        disabled={props.submitting}
        onClick={() => {
          // Change tabs
        }}
      >
        {props.title}
      </Button>
    </div>
  </Form>
);

AddPermitForm.propTypes = propTypes;
AddPermitForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    permitStatusOptions: getDropdownPermitStatusOptions(state),
    permitTypeCode: selector(state, "permit_type"),
    permitActivityTypeCode: selector(state, "permit_activity_type"),
  })),
  reduxForm({
    form: FORM.ADD_PERMIT,
    validate,
    touchOnBlur: true,
    onSubmitSuccess: resetForm(FORM.ADD_PERMIT),
  })
)(AddPermitForm);
