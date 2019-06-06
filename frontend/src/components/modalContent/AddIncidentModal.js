import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import AddIncidentFollowUpForm from "@/components/Forms/incidents/AddIncidentFollowUpForm";

import CustomPropTypes from "@/customPropTypes";

const { Step } = Steps;

const propTypes = {
  closeModal: PropTypes.func.isRequired,
  // onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string,
  // followupActionOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  incidentNumber: PropTypes.string.isRequired,
};

const defaultProps = {
  title: "",
};

// const invalidReportingPayload = (addPartyFormValues, isPerson) => false;

export class AddIncidentModal extends Component {
  state = { current: 0 };

  cancel = () => {
    this.props.closeModal();
    // this.props.reset(FORM.ADD_FULL_PARTY);
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
        incidentNumber={this.props.incidentNumber}
        initialValues={this.props.initialValues}
      />
    );
  }

  renderStep2() {
    return (
      <AddIncidentDetailForm
        initialValues={this.props.initialValues}
        doSubparagraphOptions={this.props.doSubparagraphOptions}
        incidentDeterminationOptions={this.props.incidentDeterminationOptions}
      />
    );
  }

  renderStep3() {
    return (
      <AddIncidentFollowUpForm
        initialValues={this.props.initialValues}
        incidentDeterminationOptions={this.props.incidentDeterminationOptions}
      />
    );
  }

  renderStepButtons() {
    // "You're not my real buttons, you're just stepbuttons!"
    const buttons = [];
    if (this.state.current > 0)
      buttons.push(
        <Button type="tertiary" className="full-mobile" onClick={() => this.prev()}>
          Back
        </Button>
      );

    switch (this.state.current) {
      case 0:
        buttons.push(
          <Button
            type="tertiary"
            className="full-mobile"
            onClick={() => this.next()}
            disabled={false}
          >
            Next
          </Button>
        );
        break;
      case 1:
        buttons.push(
          <Button
            type="tertiary"
            className="full-mobile"
            onClick={() => this.next()}
            disabled={false}
          >
            Next
          </Button>
        );
        buttons.push(
          <Button
            type="primary"
            className="full-mobile"
            onClick={(event) => this.handleIncidentSubmit(event, false)}
            // disabled={invalidIncidentPayload(this.props.addIncidentFormValues, this.state.isPerson)}
          >
            Save initial incident
          </Button>
        );
        break;
      case 2:
        // Follow Up
        buttons.push(
          <Button
            type="primary"
            className="full-mobile"
            onClick={(event) => this.handleIncidentSubmit(event, false)}
            // disabled={invalidIncidentPayload(this.props.addIncidentFormValues, this.state.isPerson)}
          >
            Submit
          </Button>
        );
        break;
      default:
        break;
    }

    return buttons;
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
          <h4>{this.props.title}</h4>
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

              {this.renderStepButtons()}
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

// const mapDispatchToProps = (dispatch) => ({});

AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  null
)(AddIncidentModal);
