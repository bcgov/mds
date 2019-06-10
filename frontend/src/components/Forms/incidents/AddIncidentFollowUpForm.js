import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture } from "@/utils/Validate";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  incidentStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  hasFatalities: PropTypes.bool.isRequired,
};

export class AddIncidentFollowUpForm extends Component {
  componentWillMount() {
    if (this.props.hasFatalities) {
      this.props.initialValues.mine_incident_followup_investigation_type = "MIU";
    }
  }

  render() {
    return (
      <div>
        <Form layout="vertical">
          <Row gutter={48}>
            <Col>
              <h4>Follow-up Information</h4>

              <Form.Item>
                <Field
                  id="followup_inspection_date"
                  name="followup_inspection_date"
                  label="Inspection date"
                  placeholder="Please select date and time"
                  component={renderConfig.DATE}
                  validate={[required, dateNotInFuture]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id="mine_incident_followup_investigation_type"
                  name="mine_incident_followup_investigation_type"
                  label="Was it escalated to EMPR investigation?*"
                  placeholder="Please choose one"
                  component={renderConfig.SELECT}
                  data={this.props.followupActionOptions}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id="recommendations"
                  name="recommendation"
                  label="Recommendation"
                  placeholder="Provide recommendation actions"
                  component={renderConfig.SCROLL_FIELD}
                  validate={[required]}
                />
              </Form.Item>
              <Form.Item>
                <Field
                  id="status_code"
                  name="status_code"
                  label="Incident status?*"
                  component={renderConfig.SELECT}
                  data={this.props.incidentStatusCodeOptions}
                />
              </Form.Item>

              {/* TODO: <h4>Final Investigation Report Documents</h4> */}
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

AddIncidentFollowUpForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_INCIDENT_FOLLOWUP,
  destroyOnUnmount: false,
})(AddIncidentFollowUpForm);
