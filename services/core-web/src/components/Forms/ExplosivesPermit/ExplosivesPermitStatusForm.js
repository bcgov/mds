import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getExplosivesPermitStatusDropdownOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  explosivesPermitStatusDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const ExplosivesPermitStatusForm = (props) => {
  const options = props.explosivesPermitStatusDropdownOptions.filter(({ value }) => {
    return value === "REJ" || value === "WIT";
  });
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="application_status"
              name="application_status"
              label="Application Status*"
              placeholder="Select an application status"
              component={RenderSelect}
              data={options}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="decision_reason"
              name="decision_reason"
              label="Reason*"
              validate={[required]}
              component={RenderAutoSizeField}
            />
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
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          {props.title}
        </Button>
      </div>
    </Form>
  );
};

ExplosivesPermitStatusForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  explosivesPermitStatusDropdownOptions: getExplosivesPermitStatusDropdownOptions(state),
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.EDIT_EXPLOSIVES_PERMIT_STATUS,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.EDIT_EXPLOSIVES_PERMIT_STATUS),
  })
)(ExplosivesPermitStatusForm);
