import React, { Component } from "react";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { concat, reject } from "lodash";
import { Alert, Checkbox, Steps, Button, Popconfirm } from "antd";
import PropTypes from "prop-types";
import * as Strings from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import AddIncidentReportingForm from "@/components/Forms/incidents/AddIncidentReportingForm";
import AddIncidentDetailForm from "@/components/Forms/incidents/AddIncidentDetailForm";

import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  afterClose: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
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
  !(values.reported_by_name && values.categories && values.categories.length > 0);

const invalidDetailPayload = (values) =>
  !(values.incident_date && values.incident_time && values.incident_description);

const StepForms = (
  props,
  state,
  next,
  prev,
  handleIncidentSubmit,
  uploadedFiles,
  onFileLoad,
  onRemoveFile,
  handleCheckboxChange
) => [
  {
    title: "Initial Report",
    content: (
      <AddIncidentReportingForm
        initialValues={props.initialValues}
        incidentCategoryCodeOptions={props.incidentCategoryCodeOptions}
      />
    ),
    buttons: [
      null,
      <Button
        id="step1-next"
        type="primary"
        onClick={() => next()}
        disabled={state.submitting || invalidReportingPayload(props.addIncidentFormValues)}
      >
        Next
      </Button>,
    ],
  },
  {
    title: "Add Details",
    content: (
      <>
        <AddIncidentDetailForm
          mineGuid={props.mineGuid}
          uploadedFiles={uploadedFiles.filter(
            (file) =>
              file.mine_incident_document_type_code === Strings.INCIDENT_DOCUMENT_TYPES.initial
          )}
          onFileLoad={onFileLoad}
          onRemoveFile={onRemoveFile}
        />
        <Alert
          message="You are required to contact the EMLI on call inspector at (888)-348-0299 in addition to submitting this report."
          description={
            <>
              <Checkbox
                name="visible"
                checked={state.hasConfirm}
                onChange={(event) => handleCheckboxChange(event)}
              >
                Click here to acknowledge that you understand and have contacted the EMLI On Call
                Inspector
              </Checkbox>
            </>
          }
          type="info"
          showIcon
        />
        <br />
      </>
    ),
    buttons: [
      <Button
        id="step-back"
        style={{ display: "inline", float: "left" }}
        type="tertiary"
        className="full-mobile"
        onClick={() => prev()}
        disabled={state.submitting}
      >
        Previous
      </Button>,
      <Button
        type="primary"
        style={{ display: "inline", float: "right" }}
        htmlType="submit"
        onClick={(event) => handleIncidentSubmit(event)}
        disabled={
          !state.hasConfirm || state.submitting || invalidDetailPayload(props.addIncidentFormValues)
        }
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
    hasConfirm: false,
  };

  formatTimestamp = (dateString, momentInstance) =>
    dateString && momentInstance && `${dateString} ${momentInstance.format("HH:mm")}`;

  parseFormDataIntoPayload = ({
    categories,
    incident_date,
    incident_time,
    mine_determination_type_code,
    ...remainingValues
  }) => ({
    ...remainingValues,
    categories: categories.sort(),
    incident_timestamp: this.formatTimestamp(incident_date, incident_time),
    mine_determination_type_code: mine_determination_type_code ? "DO" : "NDO",
  });

  close = () => {
    this.props.closeModal();
    this.props.afterClose();
  };

  next = () => this.setState((prevState) => ({ current: prevState.current + 1 }));

  prev = () => this.setState((prevState) => ({ current: prevState.current - 1 }));

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

  onFileLoad = (document_name, document_manager_guid, mine_incident_document_type_code) => {
    this.setState((prevState) => ({
      uploadedFiles: concat(prevState.uploadedFiles, {
        document_name,
        document_manager_guid,
        mine_incident_document_type_code,
      }),
    }));
  };

  onRemoveFile = (file) => {
    this.setState((prevState) => ({
      uploadedFiles: reject(
        prevState.uploadedFiles,
        (uploadedFile) => file.document_manager_guid === uploadedFile.document_manager_guid
      ),
    }));
  };

  handleCheckboxChange = (event) => {
    this.setState({ hasConfirm: event.target.checked });
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
      this.handleCheckboxChange
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

            <div className="ant-modal-footer">
              {Forms[this.state.current].buttons[0]}
              <Popconfirm
                placement="top"
                title="Are you sure you want to cancel?"
                okText="Yes"
                cancelText="No"
                onConfirm={this.close}
                disabled={this.state.submitting}
              >
                <Button disabled={this.state.submitting}>Cancel</Button>
              </Popconfirm>

              {Forms[this.state.current].buttons[1]}
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
