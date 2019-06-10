import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { Field, reduxForm } from "redux-form";
import { Form, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

import { required, maxLength, number, dateNotInFuture } from "@/utils/Validate";

const propTypes = {
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

class AddIncidentDetailForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      doDetermination: props.initialValues.determination_type_code,
    };
  }

  onDoDeterminationChange = (chars, value) => {
    this.setState({
      doDetermination: value,
    });
  };

  validateDoSubparagraphs = (value) =>
    value.length === 0 ? "This is a required field" : undefined;

  render() {
    return (
      <Form layout="vertical">
        <Row gutter={48}>
          <Col>
            <h4>Incident Details</h4>
            <Form.Item>
              <Field
                id="incident_timestamp"
                name="incident_timestamp"
                label="Incident Date and Time"
                placeholder="Please select date and time"
                component={renderConfig.DATE}
                showTime
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="number_of_fatalities"
                name="number_of_fatalities"
                label="Number of Fatalities:"
                component={renderConfig.FIELD}
                validate={[number, maxLength(10)]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="number_of_injuries"
                name="number_of_injuries"
                label="Number of Injuries:"
                component={renderConfig.FIELD}
                validate={[number, maxLength(10)]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="emergency_services_called"
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
                id="incident_description"
                name="incident_description"
                label="Description of incident"
                placeholder="Provide a detailed description of the incident"
                component={renderConfig.SCROLL_FIELD}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="determination_type_code"
                name="determination_type_code"
                label="Inspector's Determination*"
                component={renderConfig.SELECT}
                data={this.props.incidentDeterminationOptions}
                onChange={this.onDoDeterminationChange}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="determination_inspector_party_guid"
                name="determination_inspector_party_guid"
                label="Who made the determination?"
                component={renderConfig.SELECT}
                data={this.props.inspectors}
              />
            </Form.Item>

            {this.state.doDetermination === "DO" ? (
              <span>
                <Form.Item>
                  <Field
                    id="dangerous_occurrence_subparagraph_ids"
                    name="dangerous_occurrence_subparagraph_ids"
                    label="Which section(s) of the code apply to this dangerous occurrence?*"
                    placeholder="Please choose one or more"
                    component={renderConfig.MULTI_SELECT}
                    data={this.props.doSubparagraphOptions}
                    validate={[this.validateDoSubparagraphs]}
                  />
                </Form.Item>
                <h4>Initial Notification Documents</h4>
                <p>Insert document section here</p>
              </span>
            ) : null}

            {this.state.doDetermination === "NDO" ? (
              <span>
                <Form.Item>
                  <Field
                    id="status_code"
                    name="status_code"
                    label="Incident status?*"
                    component={renderConfig.SELECT}
                    data={this.props.incidentStatusCodeOptions}
                  />
                </Form.Item>
              </span>
            ) : null}
          </Col>
        </Row>
      </Form>
    );
  }
}

AddIncidentDetailForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_INCIDENT_DETAIL,
  destroyOnUnmount: false,
})(AddIncidentDetailForm);
