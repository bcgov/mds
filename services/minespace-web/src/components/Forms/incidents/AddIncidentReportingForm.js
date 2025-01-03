import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Divider, Col, Row, Typography } from "antd";
import {
  required,
  requiredList,
  email,
  number,
  phoneNumber,
  maxLength,
} from "@mds/common/redux/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {};

export const AddIncidentReportingForm = (props) => (
  <div>
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.ADD_INCIDENT}
      onSubmit={() => {}}
      reduxFormConfig={{
        destroyOnUnmount: false,
        forceUnregisterOnUnmount: true,
        touchOnBlur: true,
      }}
    >
      <Field
        label="Incident type(s)"
        id="categories"
        name="categories"
        placeholder="Select incident type(s)"
        component={renderConfig.MULTI_SELECT}
        required
        validate={[requiredList]}
        data={props.incidentCategoryCodeOptions}
      />
      <Divider />
      <Typography.Text>
        <h4>Reporter Details</h4>
      </Typography.Text>
      <Field
        label="Reported by"
        id="reported_by_name"
        name="reported_by_name"
        placeholder="Enter name of reporter"
        component={renderConfig.FIELD}
        required
        validate={[required]}
      />
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Field
            label="Phone number"
            id="reported_by_phone_no"
            name="reported_by_phone_no"
            placeholder="xxx-xxx-xxxx"
            component={renderConfig.FIELD}
            validate={[phoneNumber, maxLength(12)]}
            normalize={normalizePhone}
          />
        </Col>
        <Col md={12} xs={24}>
          <Field
            label="Phone extension"
            id="reported_by_phone_ext"
            name="reported_by_phone_ext"
            placeholder="xxxxxx"
            component={renderConfig.FIELD}
            validate={[number, maxLength(6)]}
          />
        </Col>
      </Row>
      <Field
        label="Email address"
        id="reported_by_email"
        name="reported_by_email"
        placeholder="example@domain.com"
        component={renderConfig.FIELD}
        validate={[email]}
      />
    </FormWrapper>
  </div>
);

AddIncidentReportingForm.propTypes = propTypes;
AddIncidentReportingForm.defaultProps = defaultProps;

export default AddIncidentReportingForm;
