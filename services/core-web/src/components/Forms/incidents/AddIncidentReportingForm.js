import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import {
  required,
  requiredList,
  email,
  number,
  phoneNumber,
  maxLength,
  dateNotInFuture,
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
};

export const AddIncidentReportingForm = (props) => (
  <div>
    <FormWrapper
      name={FORM.MINE_INCIDENT}
      reduxFormConfig={{
        destroyOnUnmount: false,
        forceUnregisterOnUnmount: true,
        touchOnBlur: true,
      }}
      onSubmit={() => { }}
    >
      <Row gutter={48}>
        <Col span={24}>
          {props.initialValues.mine_incident_id_year && (
            <h4>{`Ministry Incident No. ${props.initialValues.mine_incident_report_no}`}</h4>
          )}
          {props.initialValues.mms_inspector_initials ? (
            <span className="float-right">
              {`MMS Inspector Initials ${props.initialValues.mms_inspector_initials}`}
            </span>
          ) : (
            ""
          )}
          <Field
            id="categories"
            name="categories"
            label="Incident type(s)"
            placeholder="Select incident type(s)"
            component={renderConfig.MULTI_SELECT}
            required
            validate={[requiredList]}
            data={props.incidentCategoryCodeOptions}
          />
          <Field
            id="reported_to_inspector_party_guid"
            name="reported_to_inspector_party_guid"
            label="Incident reported to"
            placeholder="Search for inspector"
            component={renderConfig.GROUPED_SELECT}
            format={null}
            required
            validate={[required]}
            data={props.inspectors}
          />
          <Field
            id="responsible_inspector_party_guid"
            name="responsible_inspector_party_guid"
            label="Inspector responsible"
            component={renderConfig.GROUPED_SELECT}
            format={null}
            placeholder="Search for responsible inspector"
            required
            validate={[required]}
            data={props.inspectors}
          />
          <h4>Reporter Details</h4>
          <Field
            id="reported_by_name"
            name="reported_by_name"
            label="Reported by"
            placeholder="Enter name of reporter"
            component={renderConfig.FIELD}
            required
            validate={[required]}
          />
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="reported_by_phone_no"
                name="reported_by_phone_no"
                label="Phone number"
                placeholder="xxx-xxx-xxxx"
                component={renderConfig.FIELD}
                validate={[phoneNumber, maxLength(12)]}
                normalize={normalizePhone}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="reported_by_phone_ext"
                name="reported_by_phone_ext"
                label="Phone extension"
                placeholder="xxxxxx"
                component={renderConfig.FIELD}
                validate={[number, maxLength(6)]}
              />
            </Col>
          </Row>
          <Field
            id="reported_by_email"
            name="reported_by_email"
            label="Email"
            placeholder="example@domain.com"
            component={renderConfig.FIELD}
            validate={[email]}
          />
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Field
                id="reported_date"
                name="reported_date"
                label="Reported Date"
                placeholder="Please select date"
                component={renderConfig.DATE}
                required
                validate={[required, dateNotInFuture]}
              />
            </Col>
            <Col md={12} xs={24}>
              <Field
                id="reported_time"
                name="reported_time"
                label="Reported Time"
                placeholder="Please select time"
                component={renderConfig.TIME}
                required
                validate={[required]}
                fullWidth
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </FormWrapper>
  </div>
);

AddIncidentReportingForm.propTypes = propTypes;

export default AddIncidentReportingForm;
