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
  incidentStatusOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  followupActionOptions: PropTypes.objectOf(PropTypes.strings).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  // incidentNumber: PropTypes.string.isRequired,
  addReportingFormValues: PropTypes.objectOf(PropTypes.strings),
  addDetailFormValues: PropTypes.objectOf(PropTypes.strings),
  addFollowUpFormValues: PropTypes.objectOf(PropTypes.strings),
  reset: PropTypes.func.isRequired,
};

const defaultProps = {
  addReportingFormValues: {},
  addDetailFormValues: {},
  addFollowUpFormValues: {},
};

// TODO: Should move these into the forms themselves
const invalidReportingPayload = () => false;
// addReportingFormValues.reported_timestamp === undefined ||
// addReportingFormValues.reported_by_name === undefined ||
// addReportingFormValues.reported_to_inspector_party_guid === undefined ||
// addReportingFormValues.responsible_inspector_party_guid === undefined;
const invalidDetailPayload = () => false;
// addDetailFormValues.determination_inspector_party_guid === undefined ||
// (addDetailFormValues.determination_type_code === 'DO' && addDetailFormValues.DoSubparagraphs.length === 0) ||
// addDetailFormValues.determination_type_code === undefined ||
// addDetailFormValues.incident_description === undefined ||
// addDetailFormValues.emergency_services_called === undefined ||
// addDetailFormValues.incident_timestamp === undefined;

const invalidFollowUpPayload = () => false;
// addFollowUpFormValuesmine_incident_followup_investigation_type
// followup_inspection_date;
// addFollowUpFormValues.emergency_services_called;

export class AddIncidentModal extends Component {
  state = { current: 0 };

  handleIncidentSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...this.props.addReportingFormValues,
      ...this.props.addDetailFormValues,
      ...this.props.addFollowUpFormValues,
    };

    await this.props.onSubmit(payload).then((data) => {
      this.props.reset(FORM.ADD_INCIDENT_REPORTING);
      this.props.reset(FORM.ADD_INCIDENT_DETAIL);
      this.props.reset(FORM.ADD_INCIDENT_FOLLOWUP);
      this.props.closeModal();
      return data;
    });

    return Promise.resolve();
  };

  cancel = () => {
    this.props.closeModal();
    this.props.reset(FORM.ADD_INCIDENT_REPORTING);
    this.props.reset(FORM.ADD_INCIDENT_DETAIL);
    this.props.reset(FORM.ADD_INCIDENT_FOLLOWUP);
  };

  next() {
    this.setState((prevState) => ({ current: prevState.current + 1 }));
  }

  prev() {
    this.setState((prevState) => ({ current: prevState.current - 1 }));
  }

  renderStep1() {
    return (
      <AddIncidentReportingForm
        initialValues={this.props.initialValues}
        inspectors={this.props.inspectors}
      />
    );
  }

  renderStep1Buttons() {
    return (
      <Button
        id="step1-next"
        type="tertiary"
        className="full-mobile"
        onClick={() => this.next()}
        disabled={invalidReportingPayload()}
      >
        Next
      </Button>
    );
  }

  renderStep2() {
    return (
      <AddIncidentDetailForm
        initialValues={this.props.initialValues}
        doSubparagraphOptions={this.props.doSubparagraphOptions}
        incidentDeterminationOptions={this.props.incidentDeterminationOptions}
        incidentStatusOptions={this.props.incidentStatusOptions}
        inspectors={this.props.inspectors}
      />
    );
  }

  renderStep2Buttons() {
    return [
      <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => this.prev()}>
        Back
      </Button>,
      <Button
        id="step2-next"
        type="tertiary"
        className="full-mobile"
        onClick={() => this.next()}
        disabled={invalidDetailPayload()}
      >
        Next
      </Button>,
      <Button
        type="primary"
        className="full-mobile"
        onClick={(event) => this.handleIncidentSubmit(event, false)}
        disabled={invalidDetailPayload()}
      >
        Save initial incident
      </Button>,
    ];
  }

  renderStep3() {
    return (
      <AddIncidentFollowUpForm
        initialValues={this.props.initialValues}
        incidentDeterminationOptions={this.props.incidentDeterminationOptions}
        followupActionOptions={this.props.followupActionOptions}
        incidentStatusOptions={this.props.incidentStatusOptions}
      />
    );
  }

  renderStep3Buttons() {
    return [
      <Button id="step-back" type="tertiary" className="full-mobile" onClick={() => this.prev()}>
        Back
      </Button>,
      <Button
        type="primary"
        className="full-mobile"
        onClick={(event) => this.handleIncidentSubmit(event, false)}
        disabled={invalidFollowUpPayload()}
      >
        Submit
      </Button>,
    ];
  }

  render() {
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

              {this.state.current === 0 && this.renderStep1Buttons()}
              {this.state.current === 1 && this.renderStep2Buttons()}
              {this.state.current === 2 && this.renderStep3Buttons()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  addReportingFormValues: getFormValues(FORM.ADD_INCIDENT_REPORTING)(state) || {},
  addDetailFormValues: getFormValues(FORM.ADD_INCIDENT_DETAIL)(state) || {},
  addFollowUpFormValues: getFormValues(FORM.ADD_INCIDENT_FOLLOWUP)(state) || {},
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      //      submit,
      reset,
      //      change,
    },
    dispatch
  );
AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddIncidentModal);
