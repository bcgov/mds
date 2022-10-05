// Passing props into function causes linter to not recognize use of props used in that function.
/* eslint-disable react/no-unused-prop-types */
import React, { Component } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { concat, reject } from "lodash";
import { Steps, Button, Popconfirm } from "antd";
import * as Strings from "@common/constants/strings";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";
import AddIncidentFollowUpForm from "@/components/Forms/incidents/AddIncidentFollowUpForm";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  newIncident: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  followupActionOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  addIncidentFormValues: PropTypes.objectOf(PropTypes.any),
  mineGuid: PropTypes.string.isRequired,
};

const defaultProps = {
  addIncidentFormValues: {},
};

const invalidReportingPayload = (values) =>
  !(
    values.reported_date &&
    values.reported_time &&
    values.reported_by_name &&
    values.reported_to_inspector_party_guid &&
    values.responsible_inspector_party_guid &&
    values.categories &&
    values.categories.length > 0
  );

const invalidDetailPayload = (values) =>
  !(
    values.incident_date &&
    values.incident_time &&
    values.incident_description &&
    values.determination_type_code &&
    // If DO, need subparagraphs
    ((values.determination_type_code === Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance &&
      values.determination_inspector_party_guid &&
      values.dangerous_occurrence_subparagraph_ids &&
      values.dangerous_occurrence_subparagraph_ids.length !== 0) ||
      (values.determination_type_code ===
        Strings.INCIDENT_DETERMINATION_TYPES.notADangerousOccurance &&
        values.status_code &&
        values.determination_inspector_party_guid) ||
      values.determination_type_code === Strings.INCIDENT_DETERMINATION_TYPES.pending)
  );

const actionVerb = (newIncident) => {
  if (newIncident) return <span>Save&nbsp;</span>;
  return <span>Edit&nbsp;</span>;
};

const StepForms = (
  props,
  state,
  next,
  prev,
  handleIncidentSubmit,
  uploadedFiles,
  onFileLoad,
  onRemoveFile,
  invalidFollowUpPayload
) => [
  {
    title: "Initial Report",
    content: (
      <AddIncidentReportingForm
        initialValues={props.initialValues}
        inspectors={props.inspectors}
        incidentCategoryCodeOptions={props.incidentCategoryCodeOptions}
      />
    ),
    buttons: (
      <Button
        id="step1-next"
        type="tertiary"
        className="full-mobile"
        onClick={() => next()}
        disabled={state.submitting || invalidReportingPayload(props.addIncidentFormValues)}
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
          (file) =>
            file.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
        )}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
      />
    ),
    buttons: (
      <span>
        <Button
          id="step-back"
          type="tertiary"
          className="full-mobile"
          onClick={() => prev()}
          disabled={state.submitting}
        >
          Back
        </Button>
        {props.addIncidentFormValues.determination_type_code !==
          Strings.INCIDENT_DETERMINATION_TYPES.notADangerousOccurance && (
          <Button
            id="step2-next"
            type="tertiary"
            className="full-mobile"
            onClick={() => next()}
            disabled={state.submitting || invalidDetailPayload(props.addIncidentFormValues)}
          >
            Next
          </Button>
        )}
        <Button
          type="primary"
          className="full-mobile"
          onClick={(event) => handleIncidentSubmit(event, false)}
          disabled={invalidDetailPayload(props.addIncidentFormValues)}
          loading={state.submitting}
        >
          {actionVerb(props.newIncident)}
          {props.addIncidentFormValues.determination_type_code !==
            Strings.INCIDENT_DETERMINATION_TYPES.notADangerousOccurance && (
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
        determinationTypeCode={props.addIncidentFormValues.determination_type_code}
        uploadedFiles={uploadedFiles.filter(
          (file) => file.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
        )}
        onFileLoad={onFileLoad}
        onRemoveFile={onRemoveFile}
      />
    ),
    buttons: [
      <Button
        id="step-back"
        type="tertiary"
        className="full-mobile"
        onClick={() => prev()}
        disabled={state.submitting}
      >
        Back
      </Button>,
      <Button
        type="primary"
        className="full-mobile"
        onClick={(event) => handleIncidentSubmit(event, false)}
        disabled={invalidFollowUpPayload(props.addIncidentFormValues)}
        loading={state.submitting}
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
    submitting: false,
  };

  formatTimestamp = (dateString, momentInstance) =>
    dateString && momentInstance && `${dateString} ${momentInstance.format("HH:mm")}`;

  parseFormDataIntoPayload = ({
    reported_date,
    reported_time,
    incident_date,
    incident_time,
    ...remainingValues
  }) => ({
    ...remainingValues,
    reported_timestamp: this.formatTimestamp(reported_date, reported_time),
    incident_timestamp: this.formatTimestamp(incident_date, incident_time),
  });

  handleIncidentSubmit = () => {
    this.setState({ submitting: true });
    this.props
      .onSubmit({
        ...this.parseFormDataIntoPayload(this.props.addIncidentFormValues),
        updated_documents: this.state.uploadedFiles,
      })
      .then(() => this.close())
      .finally(() => this.setState({ submitting: false }));
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

  invalidFollowUpPayload = (values) => {
    let disableSubmit = true;
    const finalDocs = this.state.uploadedFiles.filter(
      (file) => file.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.final
    );
    if (values.status_code && values.followup_investigation_type_code) {
      // The date check is in this clause because this change only went into effect after Jan 20, 2021 and they did not want to block any incidents that
      // came in before this date. As of the time of this PR there were 84 incidents that met this criteria.
      if (
        finalDocs.length > 0 ||
        (finalDocs.length === 0 && values.status_code === "IRS") ||
        moment(values.reported_date) < moment("2021-01-20")
      ) {
        disableSubmit = false;
      }
    }
    return disableSubmit;
  };

  render = () => {
    const Forms = StepForms(
      this.props,
      this.state,
      this.next,
      this.prev,
      this.handleIncidentSubmit,
      this.state.uploadedFiles,
      this.onFileLoad,
      this.onRemoveFile,
      this.invalidFollowUpPayload
    );

    return (
      <div>
        <div>
          <div>
            <Steps current={this.state.current}>
              {Forms.map((step) => (
                <Steps.Step key={step.title} title={step.title} />
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
                disabled={this.state.submitting}
              >
                <Button type="secondary" className="full-mobile" disabled={this.state.submitting}>
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

AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(AddIncidentModal);
