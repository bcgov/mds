import React from "react";
// import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
// import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDate from "@/components/common/RenderDate";
import { required, dateNotInFuture } from "@/utils/Validate";

// const propTypes = {
//   isPerson: PropTypes.bool.isRequired,
//   togglePartyChange: PropTypes.func.isRequired,
//   followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
// };

export const AddIncidentFollowUpForm = () => (
  <div>
    <Form layout="vertical">
      <Row gutter={48}>
        <Col>
          <h4>Follow-up Information</h4>
          <Form.Item>
            <Field
              id="followup_inspection"
              name="emergency_services_called"
              label="Were emergency services called?*"
              placeholder="Please choose one"
              component={renderConfig.RADIO}
              data={[{ id: "yes", label: "Yes" }, { id: "no", label: "No" }]}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="followup_inspection_date"
              name="followup_inspection_date"
              label="Inspection date"
              placeholder="Please select date and time"
              component={RenderDate}
              validate={[required, dateNotInFuture]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="followup_inspection"
              name="emergency_services_called"
              label="Were emergency services called?*"
              placeholder="Please choose one"
              component={renderConfig.RADIO}
              data={[
                { id: "yes_miu", label: "Yes  - MIU Investigation" },
                { id: "yes_inspector", label: "Yes  - Inspector Investigation" },
                { id: "no", label: "No" },
              ]}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="incident_recommendations"
              name="incident_recommendations"
              label="Recommendation"
              placeholder="Provide recommendation actions"
              component={RenderAutoSizeField}
              validate={[required]}
            />
          </Form.Item>
          <p>Add another recommendation</p>

          <Form.Item>
            <Field
              id="determinator"
              name="determinator"
              label="Who made the determination?"
              placeholder="typeahead, auto populated"
              component={RenderField}
            />
          </Form.Item>
          <h4>Final Investigation Report Documents</h4>
          <p>Insert document section here</p>
        </Col>
      </Row>
    </Form>
  </div>
);

// AddIncidentFollowUpForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_INCIDENT_FOLLOWUP,
  destroyOnUnmount: false,
})(AddIncidentFollowUpForm);
