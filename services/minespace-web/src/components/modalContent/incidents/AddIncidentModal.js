import React, { Component } from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { concat, reject } from "lodash";
import { Steps, Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@common/constants/strings";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  incidentCategoryCodeOptions: CustomPropTypes.options.isRequired,
  addIncidentFormValues: PropTypes.objectOf(PropTypes.any),
  // eslint-disable-next-line react/no-unused-prop-types
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
    values.categories &&
    values.categories.length > 0
  );

// const invalidDetailPayload = (values) =>
//   !(
//     values.incident_date &&
//     values.incident_time &&
//     values.incident_description &&
//     values.determination_type_code
//   );

// const actionVerb = (newIncident) => {
//   if (newIncident) return <span>Save&nbsp;</span>;
//   return <span>Edit&nbsp;</span>;
// };

const StepForms = (
  props,
  state,
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
      <AddIncidentReportingForm incidentCategoryCodeOptions={props.incidentCategoryCodeOptions} />
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
        incidentDeterminationOptions={props.incidentDeterminationOptions}
        incidentStatusCodeOptions={props.incidentStatusCodeOptions}
        uploadedFiles={uploadedFiles.filter(
          (file) =>
            file.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
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
        onClick={(event) => handleIncidentSubmit(event)}
        loading={state.submitting}
      >
        Submit
      </Button>,
    ],
  },
];

export class AddIncidentModal extends Component {
  state = {
    current: 0,
    submitting: false,
    uploadedFiles: [],
    documentNameGuidMap: {},
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

  close = () => {
    this.props.closeModal();
    // this.props.afterClose();
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

  handleIncidentSubmit = () => {
    this.setState({ submitting: true });
    this.props.onSubmit({
      ...this.parseFormDataIntoPayload(this.props.addIncidentFormValues),
      updated_documents: this.state.uploadedFiles,
    });
    // console.log("this.props.addIncidentFormValues: ", this.props.addIncidentFormValues);
  };

  onFileLoad = (document_name, document_manager_guid, mine_incident_document_type_code) => {
    this.setState((prevState) => ({
      uploadedFiles: concat(prevState.uploadedFiles, {
        document_name,
        document_manager_guid,
        mine_incident_document_type_code,
      }),
    }));
    // console.log("mine_incident_document_type_code:", mine_incident_document_type_code);
  };

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
      this.state,
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
  addIncidentFormValues: getFormValues(FORM.ADD_INCIDENT)(state) || {},
});

AddIncidentModal.propTypes = propTypes;
AddIncidentModal.defaultProps = defaultProps;

export default connect(mapStateToProps)(AddIncidentModal);
