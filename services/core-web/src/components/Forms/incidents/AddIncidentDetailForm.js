import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row, Form } from "antd";
import {
  required,
  maxLength,
  wholeNumber,
  dateNotInFuture,
  requiredList,
} from "@common/utils/Validate";
import { MINE_INCIDENT_DOCUMENTS } from "@mds/common/constants/API";
import * as Strings from "@mds/common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FileUpload from "@/components/common/FileUpload";
import { IncidentsUploadedFilesList } from "@/components/Forms/incidents/IncidentsUploadedFilesList";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  incidentDeterminationOptions: CustomPropTypes.options.isRequired,
  doSubparagraphOptions: CustomPropTypes.options.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  incidentStatusCodeOptions: CustomPropTypes.options.isRequired,
  mineGuid: PropTypes.string.isRequired,
  doDetermination: PropTypes.string,
  uploadedFiles: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
};

const defaultProps = {
  doDetermination: Strings.INCIDENT_DETERMINATION_TYPES.pending,
};

class AddIncidentDetailForm extends Component {
  validateDoSubparagraphs = (value) =>
    value.length === 0 ? "This is a required field" : undefined;

  render() {
    return (
      <FormWrapper onSubmit={() => { }}
        name={FORM.MINE_INCIDENT}
        reduxFormConfig={{
          destroyOnUnmount: false,
          touchOnBlur: true,
          forceUnregisterOnUnmount: true,
        }}
      >
        <Row gutter={48}>
          <Col span={24}>
            <h4>Incident Details</h4>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Field
                  id="incident_date"
                  name="incident_date"
                  label="Incident Date"
                  placeholder="Please select date"
                  component={renderConfig.DATE}
                  required
                  validate={[required, dateNotInFuture]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="incident_time"
                  name="incident_time"
                  label="Incident Time"
                  placeholder="Please select time"
                  component={renderConfig.TIME}
                  required
                  validate={[required]}
                  fullWidth
                />
              </Col>
            </Row>
            <Field
              id="proponent_incident_no"
              name="proponent_incident_no"
              label="Proponent Incident Number"
              component={renderConfig.FIELD}
              validate={[maxLength(20)]}
            />
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Field
                  id="number_of_injuries"
                  name="number_of_injuries"
                  label="Number of Injuries:"
                  component={renderConfig.FIELD}
                  validate={[wholeNumber, maxLength(10)]}
                />
              </Col>
              <Col md={12} xs={24}>
                <Field
                  id="number_of_fatalities"
                  name="number_of_fatalities"
                  label="Number of Fatalities:"
                  component={renderConfig.FIELD}
                  validate={[wholeNumber, maxLength(10)]}
                />
              </Col>
            </Row>
            <Field
              id="emergency_services_called"
              name="emergency_services_called"
              label="Were emergency services called?"
              placeholder="Please choose one"
              component={renderConfig.RADIO}
            />
            <Field
              id="incident_description"
              name="incident_description"
              label="Description of incident"
              placeholder="Provide a detailed description of the incident"
              component={renderConfig.SCROLL_FIELD}
              required
              validate={[required]}
            />
            <h4>Dangerous Occurrence Determination</h4>
            <Field
              id="determination_type_code"
              name="determination_type_code"
              label="Inspectors Determination"
              component={renderConfig.SELECT}
              data={this.props.incidentDeterminationOptions}
              required
              validate={[required]}
            />
            {this.props.doDetermination !== Strings.INCIDENT_DETERMINATION_TYPES.pending ? (
              <Field
                id="determination_inspector_party_guid"
                name="determination_inspector_party_guid"
                label="Inspector who made the determination"
                component={renderConfig.GROUPED_SELECT}
                data={this.props.inspectors}
                required
                validate={[required]}
              />
            ) : null}
            {this.props.doDetermination ===
              Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
                <span>
                  <Field
                    id="dangerous_occurrence_subparagraph_ids"
                    name="dangerous_occurrence_subparagraph_ids"
                    label="Which section(s) of the code apply to this dangerous occurrence?"
                    placeholder="Please choose one or more"
                    component={renderConfig.MULTI_SELECT}
                    data={this.props.doSubparagraphOptions}
                    required
                    validate={[this.validateDoSubparagraphs]}
                  />
                </span>
              )}
            <Field
              id="mine_determination_type_code"
              name="mine_determination_type_code"
              label="Mine's Determination"
              component={renderConfig.SELECT}
              data={this.props.incidentDeterminationOptions.filter(
                ({ value }) => value !== Strings.INCIDENT_DETERMINATION_TYPES.pending
              )}
            />
            <Field
              id="mine_determination_representative"
              name="mine_determination_representative"
              label="Mine representative who made determination"
              component={renderConfig.FIELD}
              validate={[maxLength(255)]}
            />
            <h4>Initial Notification Documents</h4>
            {this.props.uploadedFiles.length > 0 && (
              <Form.Item label="Attached files" style={{ paddingBottom: "10px" }}>
                <Field
                  id="initial_documents"
                  name="initial_documents"
                  component={IncidentsUploadedFilesList}
                  files={this.props.uploadedFiles}
                  onRemoveFile={this.props.onRemoveFile}
                />
              </Form.Item>
            )}
            <Form.Item>
              <Field
                id="InitialIncidentFileUpload"
                name="InitialIncidentFileUpload"
                onFileLoad={(document_name, document_manager_guid) =>
                  this.props.onFileLoad(
                    document_name,
                    document_manager_guid,
                    Strings.INCIDENT_DOCUMENT_TYPES.initial
                  )
                }
                component={FileUpload}
                uploadUrl={MINE_INCIDENT_DOCUMENTS(this.props.mineGuid)}
              />
            </Form.Item>

            {this.props.doDetermination ===
              Strings.INCIDENT_DETERMINATION_TYPES.notADangerousOccurance && (
                <span>
                  <Field
                    id="status_code"
                    name="status_code"
                    label="Incident status?"
                    component={renderConfig.SELECT}
                    required
                    validate={[requiredList]}
                    data={this.props.incidentStatusCodeOptions}
                  />
                </span>
              )}
          </Col>
        </Row>
      </FormWrapper>
    );
  }
}

AddIncidentDetailForm.propTypes = propTypes;
AddIncidentDetailForm.defaultProps = defaultProps;

export default AddIncidentDetailForm;
