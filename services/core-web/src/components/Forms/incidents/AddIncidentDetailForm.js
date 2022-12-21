import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import {
  required,
  maxLength,
  wholeNumber,
  dateNotInFuture,
  validateSelectOptions,
} from "@common/utils/Validate";
import { MINE_INCIDENT_DOCUMENTS } from "@common/constants/API";
import * as Strings from "@common/constants/strings";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FileUpload from "@/components/common/FileUpload";
import { IncidentsUploadedFilesList } from "@/components/Forms/incidents/IncidentsUploadedFilesList";

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
      <Form layout="vertical">
        <Row gutter={48}>
          <Col span={24}>
            <h4>Incident Details</h4>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="incident_date"
                    name="incident_date"
                    label="Incident Date*"
                    placeholder="Please select date"
                    component={renderConfig.DATE}
                    validate={[required, dateNotInFuture]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="incident_time"
                    name="incident_time"
                    label="Incident Time*"
                    placeholder="Please select time"
                    component={renderConfig.TIME}
                    validate={[required]}
                    fullWidth
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Field
                id="proponent_incident_no"
                name="proponent_incident_no"
                label="Proponent Incident Number"
                component={renderConfig.FIELD}
                validate={[maxLength(20)]}
              />
            </Form.Item>
            <Row gutter={16}>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="number_of_injuries"
                    name="number_of_injuries"
                    label="Number of Injuries:"
                    component={renderConfig.FIELD}
                    validate={[wholeNumber, maxLength(10)]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item>
                  <Field
                    id="number_of_fatalities"
                    name="number_of_fatalities"
                    label="Number of Fatalities:"
                    component={renderConfig.FIELD}
                    validate={[wholeNumber, maxLength(10)]}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Field
                id="emergency_services_called"
                name="emergency_services_called"
                label="Were emergency services called?"
                placeholder="Please choose one"
                component={renderConfig.RADIO}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="incident_description"
                name="incident_description"
                label="Description of incident*"
                placeholder="Provide a detailed description of the incident"
                component={renderConfig.SCROLL_FIELD}
                validate={[required]}
              />
            </Form.Item>
            <h4>Dangerous Occurrence Determination</h4>
            <Form.Item>
              <Field
                id="determination_type_code"
                name="determination_type_code"
                label="Inspectors Determination*"
                component={renderConfig.SELECT}
                data={this.props.incidentDeterminationOptions}
                validate={[
                  required,
                  validateSelectOptions(this.props.incidentDeterminationOptions),
                ]}
              />
            </Form.Item>
            {this.props.doDetermination !== Strings.INCIDENT_DETERMINATION_TYPES.pending ? (
              <Form.Item>
                <Field
                  id="determination_inspector_party_guid"
                  name="determination_inspector_party_guid"
                  label="Inspector who made the determination*"
                  component={renderConfig.GROUPED_SELECT}
                  data={this.props.inspectors}
                  validate={[required]}
                />
              </Form.Item>
            ) : null}
            {this.props.doDetermination ===
              Strings.INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
              <span>
                <Form.Item>
                  <Field
                    id="dangerous_occurrence_subparagraph_ids"
                    name="dangerous_occurrence_subparagraph_ids"
                    label="Which section(s) of the code apply to this dangerous occurrence?*"
                    placeholder="Please choose one or more"
                    component={renderConfig.MULTI_SELECT}
                    data={this.props.doSubparagraphOptions}
                    validate={[this.validateDoSubparagraphs]}
                  />
                </Form.Item>
              </span>
            )}
            <Form.Item>
              <Field
                id="mine_determination_type_code"
                name="mine_determination_type_code"
                label="Mine's Determination"
                component={renderConfig.SELECT}
                validate={[validateSelectOptions(this.props.incidentDeterminationOptions)]}
                data={this.props.incidentDeterminationOptions.filter(
                  ({ value }) => value !== Strings.INCIDENT_DETERMINATION_TYPES.pending
                )}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="mine_determination_representative"
                name="mine_determination_representative"
                label="Mine representative who made determination"
                component={renderConfig.FIELD}
                validate={[maxLength(255)]}
              />
            </Form.Item>
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
                <Form.Item>
                  <Field
                    id="status_code"
                    name="status_code"
                    label="Incident status?*"
                    component={renderConfig.SELECT}
                    validate={[validateSelectOptions(this.props.incidentStatusCodeOptions)]}
                    data={this.props.incidentStatusCodeOptions}
                  />
                </Form.Item>
              </span>
            )}
          </Col>
        </Row>
      </Form>
    );
  }
}

AddIncidentDetailForm.propTypes = propTypes;
AddIncidentDetailForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.MINE_INCIDENT,
  destroyOnUnmount: false,
  touchOnBlur: true,
  forceUnregisterOnUnmount: true,
})(AddIncidentDetailForm);
