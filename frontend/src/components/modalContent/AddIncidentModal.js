// Passing props into function causes linter to not recognize use of props used in that function.
/* eslint-disable react/no-unused-prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues, destroy } from "redux-form";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import AddIncidentFollowUpForm from "@/components/Forms/incidents/AddIncidentFollowUpForm";

import CustomPropTypes from "@/customPropTypes";

const { Step } = Steps;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  followupActionOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  addIncidentFormValues: PropTypes.objectOf(PropTypes.any),
  // resetForm: PropTypes.func.isRequired,
};

const defaultProps = {
  addIncidentFormValues: {},
};

const invalidReportingPayload = (values) =>
  values.reported_timestamp === undefined ||
  values.reported_by_name === undefined ||
  values.reported_to_inspector_party_guid === undefined ||
  values.responsible_inspector_party_guid === undefined;

const invalidDetailPayload = (values) =>
  values.determination_inspector_party_guid === undefined ||
  // If DO, need subparagraphs
  (values.determination_type_code === "DO" &&
    values.DoSubparagraphs &&
    values.DoSubparagraphs.length === 0) ||
  // If NDO, need incident status
  (values.determination_type_code === "NDO" && values.status_code === undefined) ||
  values.determination_type_code === undefined ||
  values.incident_description === undefined ||
  values.emergency_services_called === undefined ||
  values.incident_timestamp === undefined;

const invalidFollowUpPayload = (values) =>
  values.status_code === undefined ||
  values.mine_incident_followup_investigation_type === undefined;

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
        disabled={invalidReportingPayload(props.addIncidentFormValues)}
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
        {props.addIncidentFormValues.determination_type_code !== "NDO" && (
          <Button
            id="step2-next"
            type="tertiary"
            className="full-mobile"
            onClick={() => next()}
            disabled={invalidDetailPayload(props.addIncidentFormValues)}
          >
            Next
          </Button>
        )}
        <Button
          type="primary"
          className="full-mobile"
          onClick={(event) => handleIncidentSubmit(event, false)}
          disabled={invalidDetailPayload(props.addIncidentFormValues)}
        >
          Save&nbsp;
          {props.addIncidentFormValues.determination_type_code !== "NDO" && (
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
        hasFatalities={props.addIncidentFormValues.number_of_fatalities > 0}
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
        disabled={invalidFollowUpPayload(props.addIncidentFormValues)}
      >
        Submit
      </Button>,
    ],
  },
];

export class AddIncidentModal extends Component {
  state = { current: 0 };

  handleIncidentSubmit = () => {
    this.props.onSubmit({
      ...this.props.addIncidentFormValues,
    });
    // TODO: Catch error
    this.props.destroy();
  };

  cancel = () => {
    this.props.destroy(FORM.MINE_INCIDENT);
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
  addIncidentFormValues: getFormValues(FORM.MINE_INCIDENT)(state) || {},
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      destroy,
      // resetForm: (form) => dispatch(reset(form)),
    },
    dispatch
  );
AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddIncidentModal);
