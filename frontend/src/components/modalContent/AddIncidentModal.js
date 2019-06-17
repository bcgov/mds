// Passing props into function causes linter to not recognize use of props used in that function.
/* eslint-disable react/no-unused-prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, reset } from "redux-form";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import AddIncidentFollowUpForm from "@/components/Forms/incidents/AddIncidentFollowUpForm";

import CustomPropTypes from "@/customPropTypes";

const { Step } = Steps;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  followupActionOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  addReportingFormValues: PropTypes.objectOf(PropTypes.any),
  addDetailFormValues: PropTypes.objectOf(PropTypes.any),
  addFollowUpFormValues: PropTypes.objectOf(PropTypes.any),
  resetForm: PropTypes.func.isRequired,
};

const defaultProps = {
  addReportingFormValues: {},
  addDetailFormValues: {},
  addFollowUpFormValues: {},
};

const invalidReportingPayload = (addReportingFormValues) =>
  addReportingFormValues.reported_timestamp === undefined ||
  addReportingFormValues.reported_by_name === undefined ||
  addReportingFormValues.reported_to_inspector_party_guid === undefined ||
  addReportingFormValues.responsible_inspector_party_guid === undefined;

const invalidDetailPayload = (addDetailFormValues) =>
  addDetailFormValues.determination_inspector_party_guid === undefined ||
  // If DO, need subparagraphs
  (addDetailFormValues.determination_type_code === "DO" &&
    addDetailFormValues.DoSubparagraphs &&
    addDetailFormValues.DoSubparagraphs.length === 0) ||
  // If NDO, need incident status
  (addDetailFormValues.determination_type_code === "NDO" &&
    addDetailFormValues.status_code === undefined) ||
  addDetailFormValues.determination_type_code === undefined ||
  addDetailFormValues.incident_description === undefined ||
  addDetailFormValues.emergency_services_called === undefined ||
  addDetailFormValues.incident_timestamp === undefined;

const invalidFollowUpPayload = (addFollowUpFormValues) =>
  addFollowUpFormValues.status_code === undefined ||
  addFollowUpFormValues.mine_incident_followup_investigation_type === undefined;

const StepForms = (props, next, prev, handleIncidentSubmit) => [
  {
    title: "Initial Report",
    content: (
      <AddIncidentReportingForm initialValues={props.initialValues} inspectors={props.inspectors} />
    ),
    buttons: (
      <Button
        id="step1-next"
        type="tertiary"
        className="full-mobile"
        onClick={() => next()}
        disabled={invalidReportingPayload(props.addReportingFormValues)}
      >
        Next
      </Button>
    ),
  },
  {
    title: "Add Details",
    content: (
      <AddIncidentDetailForm
        initialValues={props.initialValues}
        doSubparagraphOptions={props.doSubparagraphOptions}
        incidentDeterminationOptions={props.incidentDeterminationOptions}
        incidentStatusCodeOptions={props.incidentStatusCodeOptions}
        inspectors={props.inspectors}
      />
    ),
    buttons: (
      <span>
        <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => prev()}>
          Back
        </Button>
        {props.addDetailFormValues.determination_type_code !== "NDO" && (
          <Button
            id="step2-next"
            type="tertiary"
            className="full-mobile"
            onClick={() => next()}
            disabled={invalidDetailPayload(props.addDetailFormValues)}
          >
            Next
          </Button>
        )}
        <Button
          type="primary"
          className="full-mobile"
          onClick={(event) => handleIncidentSubmit(event, false)}
          disabled={invalidDetailPayload(props.addDetailFormValues)}
        >
          Save&nbsp;
          {props.addDetailFormValues.determination_type_code !== "NDO" && (
            <span>initial&nbsp;</span>
          )}
          incident
        </Button>
      </span>
    ),
  },
  {
    title: "Follow Up",
    content: (
      <AddIncidentFollowUpForm
        initialValues={props.initialValues}
        incidentDeterminationOptions={props.incidentDeterminationOptions}
        followupActionOptions={props.followupActionOptions}
        incidentStatusCodeOptions={props.incidentStatusCodeOptions}
        hasFatalities={props.addDetailFormValues.number_of_fatalities > 0}
      />
    ),
    buttons: [
      <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => prev()}>
        Back
      </Button>,
      <Button
        type="primary"
        className="full-mobile"
        onClick={(event) => handleIncidentSubmit(event, false)}
        disabled={invalidFollowUpPayload(props.addFollowUpFormValues)}
      >
        Submit
      </Button>,
    ],
  },
];

export class AddIncidentModal extends Component {
  state = { current: 0 };

  handleIncidentSubmit = () =>
    this.props.onSubmit({
      ...this.props.addReportingFormValues,
      ...this.props.addDetailFormValues,
      ...this.props.addFollowUpFormValues,
    });

  resetForms = () => {
    this.props.resetForm(FORM.ADD_INCIDENT_REPORTING);
    this.props.resetForm(FORM.ADD_INCIDENT_DETAIL);
    this.props.resetForm(FORM.ADD_INCIDENT_FOLLOWUP);
  };

  cancel = () => {
    this.resetForms();
    this.props.closeModal();
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  render = () => {
    const Forms = StepForms(this.props, this.next, this.prev, this.handleIncidentSubmit);

    return (
      <div>
        <div>
          <div>
            <Steps current={this.state.current}>
              {Forms.map((step) => (
                <Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <br />

            <div>{Forms[this.state.current].content}</div>

            <div className="right center-mobile">
              <Popconfirm
                placement="top"
                title="Are you sure you want to cancel?"
                okText="Yes"
                cancelText="No"
                onConfirm={this.cancel}
              >
                <Button type="secondary" className="full-mobile">
                  Cancel
                </Button>
              </Popconfirm>

              {Forms[this.state.current].buttons}
            </div>
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => ({
  addReportingFormValues: getFormValues(FORM.ADD_INCIDENT_REPORTING)(state) || {},
  addDetailFormValues: getFormValues(FORM.ADD_INCIDENT_DETAIL)(state) || {},
  addFollowUpFormValues: getFormValues(FORM.ADD_INCIDENT_FOLLOWUP)(state) || {},
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      resetForm: (form) => dispatch(reset(form)),
    },
    dispatch
  );
AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddIncidentModal);
