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

// TODO: Should move these into the forms themselves
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

  renderStep1 = () => (
    <AddIncidentReportingForm
      initialValues={this.props.initialValues}
      inspectors={this.props.inspectors}
    />
  );

  renderStep1Buttons = () => (
    <Button
      id="step1-next"
      type="tertiary"
      className="full-mobile"
      onClick={() => this.next()}
      disabled={invalidReportingPayload(this.props.addReportingFormValues)}
    >
      Next
    </Button>
  );

  renderStep2 = () => (
    <AddIncidentDetailForm
      initialValues={this.props.initialValues}
      doSubparagraphOptions={this.props.doSubparagraphOptions}
      incidentDeterminationOptions={this.props.incidentDeterminationOptions}
      incidentStatusCodeOptions={this.props.incidentStatusCodeOptions}
      inspectors={this.props.inspectors}
    />
  );

  renderStep2Buttons = () => {
    const determination = this.props.addDetailFormValues.determination_type_code;

    return (
      <span>
        <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => this.prev()}>
          Back
        </Button>
        {determination !== "NDO" && (
          <Button
            id="step2-next"
            type="tertiary"
            className="full-mobile"
            onClick={() => this.next()}
            disabled={invalidDetailPayload(this.props.addDetailFormValues)}
          >
            Next
          </Button>
        )}
        <Button
          type="primary"
          className="full-mobile"
          onClick={(event) => this.handleIncidentSubmit(event, false)}
          disabled={invalidDetailPayload(this.props.addDetailFormValues)}
        >
          Save&nbsp;{determination !== "NDO" && <span>initial&nbsp;</span>}incident
        </Button>
      </span>
    );
  };

  renderStep3 = () => (
    <AddIncidentFollowUpForm
      initialValues={this.props.initialValues}
      incidentDeterminationOptions={this.props.incidentDeterminationOptions}
      followupActionOptions={this.props.followupActionOptions}
      incidentStatusCodeOptions={this.props.incidentStatusCodeOptions}
      hasFatalities={this.props.addDetailFormValues.number_of_fatalities > 0}
    />
  );

  renderStep3Buttons = () => [
    <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => this.prev()}>
      Back
    </Button>,
    <Button
      type="primary"
      className="full-mobile"
      onClick={(event) => this.handleIncidentSubmit(event, false)}
      disabled={invalidFollowUpPayload(this.props.addFollowUpFormValues)}
    >
      Submit
    </Button>,
  ];

  render = () => {
    const steps = [
      {
        title: "Initial Report",
        content: this.renderStep1(),
      },
      {
        title: "Add Details",
        content: this.renderStep2(),
      },
      {
        title: "Follow Up",
        content: this.renderStep3(),
      },
    ];

    return (
      <div>
        <div>
          <div>
            <Steps current={this.state.current}>
              {steps.map((step) => (
                <Step key={step.title} title={step.title} />
              ))}
            </Steps>
            <br />

            <div>{steps[this.state.current].content}</div>

            <div className="right center-mobile">
              <Button type="secondary" className="full-mobile" onClick={() => this.resetForms()}>
                Reset
              </Button>
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

              {/* Issue with rendering if we follow same approach as step content above */}
              {this.state.current === 0 && this.renderStep1Buttons()}
              {this.state.current === 1 && this.renderStep2Buttons()}
              {this.state.current === 2 && this.renderStep3Buttons()}
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
