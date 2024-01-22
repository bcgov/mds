import {
  INCIDENT_DETERMINATION_TYPES,
  INCIDENT_FOLLOWUP_ACTIONS,
} from "@mds/common/constants/strings";
import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, FieldArray, getFormValues } from "redux-form";
import { ADD_EDIT_INCIDENT } from "@/constants/forms";
import { Button, Col, Row, Typography } from "antd";
import { renderConfig } from "@/components/common/config";
import { required, validateSelectOptions } from "@common/utils/Validate";
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

  const validateDoSubparagraphs = (value) =>
    value?.length === 0 ? "This is a required field" : undefined;

  const renderRecommendations = ({ fields, isEditMode }) => (
    <div className="ant-form-vertical">
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
    </div>
  );

  return (
    <Row className="ant-form-vertical">
      <Col span={24}>
        <Typography.Title level={3} id="ministry-follow-up">
          Ministry Follow Up
        </Typography.Title>
        <h4>Dangerous Occurence Determination</h4>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              label="Inspector's Determination"
              id="determination_type_code"
              name="determination_type_code"
              placeholder="Select determination..."
              component={renderConfig.SELECT}
              data={incidentDeterminationOptions}
              disabled={!isEditMode}
              validate={[validateSelectOptions(incidentDeterminationOptions)]}
            />
          </Col>
          {formValues?.determination_type_code &&
            formValues?.determination_type_code !== INCIDENT_DETERMINATION_TYPES.pending && (
              <Col xs={24} md={12}>
                <Field
                  label="Inspector who made the determination"
                  id="determination_inspector_party_guid"
                  name="determination_inspector_party_guid"
                  component={renderConfig.GROUPED_SELECT}
                  data={inspectorOptions}
                  validate={[required]}
                  disabled={!isEditMode}
                />
              </Col>
            )}
          {formValues?.determination_type_code ===
            INCIDENT_DETERMINATION_TYPES.dangerousOccurance && (
            <Col xs={24} md={12}>
              <Field
                label="Which section(s) of the code apply to this dangerous occurrence?"
                id="dangerous_occurrence_subparagraph_ids"
                name="dangerous_occurrence_subparagraph_ids"
                placeholder="Please choose one or more..."
                component={renderConfig.MULTI_SELECT}
                data={dangerousOccurenceSubparagraphOptions}
                validate={[required, validateDoSubparagraphs]}
                disabled={!isEditMode}
              />
            </Col>
          )}
          {formValues.verbal_notification_provided && (
            <Col md={12} xs={24}>
              <Field
                label="Date and time"
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
            </Col>
          )}
          <Col span={24}>
            <Field
              label="Was it escalated to EMLI investigation?"
              id="followup_investigation_type_code"
              name="followup_investigation_type_code"
              component={renderConfig.RADIO}
              customOptions={filteredFollowUpActions}
              disabled={!isEditMode}
              validate={validateSelectOptions(filteredFollowUpActions)}
            />
          </Col>
          <Col span={24}>
            <FieldArray
              label="Mine manager's recommendations"
              id="recommendations"
              name="recommendations"
              component={renderRecommendations}
              {...{
                isEditMode,
              }}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default IncidentFormMinistryFollowup;
