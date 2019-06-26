// Passing props into function causes linter to not recognize use of props used in that function.
/* eslint-disable react/no-unused-prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getFormValues } from "redux-form";
import { concat, reject } from "lodash";
import { Steps, Button, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import AddIncidentFollowUpForm from "@/components/Forms/incidents/AddIncidentFollowUpForm";

import CustomPropTypes from "@/customPropTypes";

const { Step } = Steps;

const propTypes = {
  newIncident: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  followupActionOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  addIncidentFormValues: PropTypes.objectOf(PropTypes.any),
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {
  addIncidentFormValues: {},
};

const invalidReportingPayload = (values) =>
  !(
    values.reported_timestamp &&
    values.reported_by_name &&
    values.reported_to_inspector_party_guid &&
    values.responsible_inspector_party_guid
  );

const invalidDetailPayload = (values) =>
  !(
    values.incident_timestamp &&
    values.incident_description &&
    values.determination_type_code &&
    // If DO, need subparagraphs
    ((values.determination_type_code === "DO" &&
      values.determination_inspector_party_guid &&
      values.dangerous_occurrence_subparagraph_ids &&
      values.dangerous_occurrence_subparagraph_ids.length !== 0) ||
      (values.determination_type_code === "NDO" &&
        values.status_code &&
        values.determination_inspector_party_guid) ||
      values.determination_type_code === "PEN")
  );

const invalidFollowUpPayload = (values) =>
  !(values.status_code && values.followup_investigation_type_code);

const actionVerb = (newIncident) => {
  if (newIncident) return <span>Save&nbsp;</span>;
  return <span>Edit&nbsp;</span>;
};

const StepForms = (
  props,
  next,
  prev,
  handleIncidentSubmit,
  uploadedFiles,
  onFileLoad,
  onRemoveFile
) => [
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
        mineGuid={props.mineGuid}
        initialValues={props.initialValues}
        doSubparagraphOptions={props.doSubparagraphOptions}
        incidentDeterminationOptions={props.incidentDeterminationOptions}
        incidentStatusCodeOptions={props.incidentStatusCodeOptions}
        inspectors={props.inspectors}
        doDetermination={props.addIncidentFormValues.determination_type_code}
        uploadedFiles={uploadedFiles.filter(
          (file) => file.mine_incident_document_type_code === "INI"
        )}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
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
          {actionVerb(props.newIncident)}
          {props.addIncidentFormValues.determination_type_code !== "NDO" && (
            <span>Initial&nbsp;</span>
          )}
          Incident
        </Button>
      </span>
    ),
  },
  {
    title: "Follow Up",
    content: (
      <AddIncidentFollowUpForm
        mineGuid={props.mineGuid}
        initialValues={props.initialValues}
        incidentDeterminationOptions={props.incidentDeterminationOptions}
        followupActionOptions={props.followupActionOptions}
        incidentStatusCodeOptions={props.incidentStatusCodeOptions}
        hasFatalities={props.addIncidentFormValues.number_of_fatalities > 0 || false}
        hasFollowUp={props.addIncidentFormValues.followup_inspection || false}
        uploadedFiles={uploadedFiles.filter(
          (file) => file.mine_incident_document_type_code === "FIN"
        )}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
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
        {actionVerb(props.newIncident)}
        Incident
      </Button>,
    ],
  },
];

export class AddIncidentModal extends Component {
  state = {
    current: 0,
    uploadedFiles: this.props.initialValues.documents
      ? [...this.props.initialValues.documents]
      : [],
  };

  handleIncidentSubmit = () => {
    this.props.onSubmit({
      ...this.props.addIncidentFormValues,
      updated_documents: this.state.uploadedFiles,
    });
    // TODO: Catch error
    this.close();
  };

  close = () => {
    this.props.closeModal();
    this.props.afterClose();
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  onFileLoad = (document_name, document_manager_guid, mine_incident_document_type_code) =>
    this.setState((prevState) => ({
      uploadedFiles: concat(prevState.uploadedFiles, {
        document_name,
        document_manager_guid,
        mine_incident_document_type_code,
      }),
    }));

  onRemoveFile = (file) => {
    this.setState((prevState) => ({
      uploadedFiles: reject(
        prevState.uploadedFiles,
        (uploadedFile) => file.document_manager_guid === uploadedFile.document_manager_guid
      ),
    }));
  };

  render = () => {
    const Forms = StepForms(
      this.props,
      this.next,
      this.prev,
      this.handleIncidentSubmit,
      this.state.uploadedFiles,
      this.onFileLoad,
      this.onRemoveFile
    );

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
                onConfirm={this.close}
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

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);
AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddIncidentModal);
