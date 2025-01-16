import React, { Component } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { Col, Row } from "antd";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { dateNotBeforeOther, dateNotAfterOther, date } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.objectOf(PropTypes.any)]).isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = {
  initialValues: {},
};

export class AddMineWorkInformationForm extends Component {
  render() {
    return (
      <FormWrapper name={FORM.ADD_MINE_WORK_INFORMATION} onSubmit={this.props.onSubmit}
        initialValues={this.props.initialValues}
        isModal
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Field
              id="work_start_date"
              name="work_start_date"
              label="Work Start Date"
              placeholder="Select Work Start Date"
              component={renderConfig.DATE}
              validate={[date, dateNotAfterOther(this.props.formValues.work_stop_date)]}
              format={null}
            />
          </Col>
          <Col span={12}>
            <Field
              id="work_stop_date"
              name="work_stop_date"
              label="Work Stop Date"
              placeholder="Select Work Stop Date"
              component={renderConfig.DATE}
              validate={[date, dateNotBeforeOther(this.props.formValues.work_start_date)]}
              format={null}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="work_comments"
              name="work_comments"
              label="Comments"
              placeholder="Enter Comments"
              component={renderConfig.AUTO_SIZE_FIELD}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText={this.props.title} />
        </div>
      </FormWrapper>
    );
  }
}

AddMineWorkInformationForm.propTypes = propTypes;
AddMineWorkInformationForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ADD_MINE_WORK_INFORMATION)(state) || {},
  }))
)(AddMineWorkInformationForm);
