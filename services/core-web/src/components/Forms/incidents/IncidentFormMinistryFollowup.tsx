import {
  INCIDENT_CONTACT_METHOD_OPTIONS,
  INCIDENT_DETERMINATION_TYPES,
  INCIDENT_FOLLOWUP_ACTIONS,
} from "@mds/common/constants/strings";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, FieldArray, getFormValues } from "redux-form";
import { ADD_EDIT_INCIDENT } from "@/constants/forms";
import { Button, Col, Form, Row, Typography } from "antd";
import { renderConfig } from "@/components/common/config";
import { required, requiredRadioButton, validateSelectOptions } from "@common/utils/Validate";
import RenderDateTimeTz from "@/components/common/RenderDateTimeTz";
import { normalizeDatetime } from "@mds/common/redux/utils/helpers";
import { dateNotBeforeStrictOther, dateNotInFutureTZ } from "@mds/common/redux/utils/Validate";
import { PlusOutlined } from "@ant-design/icons";

interface IncidentFormMinistryFollowupProps {
  isEditMode: boolean;
  incidentDeterminationOptions: any[];
  incidentFollowUpActionOptions: any[];
  dangerousOccurenceSubparagraphOptions: any[];
  inspectorOptions: any[];
}

const IncidentFormMinistryFollowup: FC<IncidentFormMinistryFollowupProps> = ({
  isEditMode,
  incidentDeterminationOptions,
  incidentFollowUpActionOptions,
  dangerousOccurenceSubparagraphOptions,
  inspectorOptions,
}) => {
  const formValues = useSelector((state) => getFormValues(ADD_EDIT_INCIDENT)(state));

  const filteredFollowUpActions = incidentFollowUpActionOptions.filter(
    (act) => act.mine_incident_followup_investigation_type !== INCIDENT_FOLLOWUP_ACTIONS.unknown
  );

  const retrieveInitialReportDynamicValidation = (formValues) => {
    const inspectorSet = formValues?.reported_to_inspector_party_guid;
    const workerRepSet = formValues?.johsc_worker_rep_name;
    const managementRepSet = formValues?.johsc_management_rep_name;

    return {
      inspectorContactedValidation: inspectorSet ? { validate: [requiredRadioButton] } : {},
      inspectorContacted: formValues?.reported_to_inspector_contacted,
      workerRepContactedValidation: workerRepSet ? { validate: [requiredRadioButton] } : {},
      workerRepContacted: formValues?.johsc_worker_rep_contacted,
      managementRepContactedValidation: managementRepSet ? { validate: [requiredRadioButton] } : {},
      managementRepContacted: formValues?.johsc_management_rep_contacted,
    };
  };

  const {
    inspectorContactedValidation,
    inspectorContacted,
  } = retrieveInitialReportDynamicValidation(formValues);

  const validateDoSubparagraphs = (value) =>
    value?.length === 0 ? "This is a required field" : undefined;

  const renderRecommendations = ({ fields, isEditMode }) => (
    <Form layout="vertical">
      {fields.map((recommendation, index) => (
        <Field
          key={index}
          name={`${recommendation}.recommendation`}
          placeholder="Write in each individual Mine Manager Recommendation here"
          component={renderConfig.AUTO_SIZE_FIELD}
          disabled={!isEditMode}
        />
      ))}
      {isEditMode && (
        <Button type="primary" onClick={() => fields.push({})}>
          <PlusOutlined />
          Add Recommendation
        </Button>
      )}
    </Form>
  );

  return (
    <Row>
      <Col span={24}>
        <Typography.Title level={3} id="ministry-follow-up">
          Ministry Follow Up
        </Typography.Title>
        <h4>Dangerous Occurence Determination</h4>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Inspector's Determination">
              <Field
                id="determination_type_code"
                name="determination_type_code"
                placeholder="Select determination..."
                component={renderConfig.SELECT}
                data={incidentDeterminationOptions}
                disabled={!isEditMode}
                validate={[validateSelectOptions(incidentDeterminationOptions)]}
              />
            </Form.Item>
          </Col>
          {formValues?.determination_type_code &&
            formValues?.determination_type_code !== INCIDENT_DETERMINATION_TYPES.pending && (
              <Col xs={24} md={12}>
                <Form.Item label="* Inspector who made the determination">
                  <Field
                    id="determination_inspector_party_guid"
                    name="determination_inspector_party_guid"
                    component={renderConfig.GROUPED_SELECT}
                    data={inspectorOptions}
                    validate={[required]}
                    disabled={!isEditMode}
                  />
                </Form.Item>
              </Col>
            )}
          {formValues?.determination_type_code ===
            INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
            <Col xs={24} md={12}>
              <Form.Item label="* Which section(s) of the code apply to this dangerous occurrence?">
                <Field
                  id="dangerous_occurrence_subparagraph_ids"
                  name="dangerous_occurrence_subparagraph_ids"
                  placeholder="Please choose one or more..."
                  component={renderConfig.MULTI_SELECT}
                  data={dangerousOccurenceSubparagraphOptions}
                  validate={[required, validateDoSubparagraphs]}
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <h4>Verbal Notification</h4>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was verbal notification of the incident provided through the Mine Incident Reporting Line (1-888-348-0299)?">
              <Field
                id="verbal_notification_provided"
                name="verbal_notification_provided"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          {formValues.verbal_notification_provided && (
            <Col md={12} xs={24}>
              <Form.Item label="Date and time">
                <Field
                  id="verbal_notification_timestamp"
                  name="verbal_notification_timestamp"
                  component={RenderDateTimeTz}
                  normalize={normalizeDatetime}
                  timezone={formValues.incident_timezone}
                  showTime
                  disabled={!isEditMode}
                  placeholder="Please select date"
                  validate={[
                    dateNotInFutureTZ,
                    dateNotBeforeStrictOther(formValues.incident_timestamp),
                  ]}
                />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <h4>Follow-Up Information</h4>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Incident reported to">
              <Field
                id="reported_to_inspector_party_guid"
                name="reported_to_inspector_party_guid"
                placeholder="Search for inspector..."
                component={renderConfig.GROUPED_SELECT}
                format={null}
                data={inspectorOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was this person contacted?">
              <Field
                id="reported_to_inspector_contacted"
                name="reported_to_inspector_contacted"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
                validate={[]}
                {...inspectorContactedValidation}
              />
            </Form.Item>
          </Col>
          {inspectorContacted && (
            <>
              <Col md={12} xs={24}>
                <Form.Item label="Date and time">
                  <Field
                    id="reported_timestamp"
                    name="reported_timestamp"
                    component={RenderDateTimeTz}
                    normalize={normalizeDatetime}
                    timezone={formValues.incident_timezone}
                    showTime
                    disabled={!isEditMode}
                    placeholder="Please select date"
                    validate={[
                      required,
                      dateNotInFutureTZ,
                      dateNotBeforeStrictOther(formValues.incident_timestamp),
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col md={12} xs={24}>
                <Form.Item label="Initial Contact Method">
                  <Field
                    id="reported_to_inspector_contact_method"
                    name="reported_to_inspector_contact_method"
                    component={renderConfig.SELECT}
                    data={INCIDENT_CONTACT_METHOD_OPTIONS.filter((cm) => cm?.inspectorOnly)}
                    disabled={!isEditMode}
                    validate={[required]}
                  />
                </Form.Item>
              </Col>
            </>
          )}
          <Col md={12} xs={24}>
            <Form.Item label="Inspector responsible">
              <Field
                id="responsible_inspector_party_guid"
                name="responsible_inspector_party_guid"
                component={renderConfig.GROUPED_SELECT}
                format={null}
                placeholder="Search for responsible inspector..."
                data={inspectorOptions}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Was there a follow-up inspection?">
              <Field
                id="followup_inspection"
                name="followup_inspection"
                component={renderConfig.RADIO}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Follow-up inspection date">
              <Field
                id="followup_inspection_date"
                name="followup_inspection_date"
                placeholder="Please select date..."
                showTime={false}
                component={RenderDateTimeTz}
                normalize={normalizeDatetime}
                timezone={formValues.incident_timezone}
                validate={[
                  dateNotInFutureTZ,
                  dateNotBeforeStrictOther(formValues.incident_timestamp),
                ]}
                disabled={!isEditMode}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Was it escalated to EMLI investigation?">
              <Field
                id="followup_investigation_type_code"
                name="followup_investigation_type_code"
                component={renderConfig.RADIO}
                customOptions={filteredFollowUpActions}
                disabled={!isEditMode}
                validate={validateSelectOptions(filteredFollowUpActions)}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Mine manager's recommendations">
              <FieldArray
                id="recommendations"
                name="recommendations"
                component={renderRecommendations}
                {...{
                  isEditMode,
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default IncidentFormMinistryFollowup;
