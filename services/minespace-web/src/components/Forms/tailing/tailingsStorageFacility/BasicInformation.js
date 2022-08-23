import React from "react";
import { Col, Row, Typography } from "antd";
import { Field } from "redux-form";
import { maxLength, requiredList } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const BasicInformation = () => (
  <>
    <Typography.Title level={3}>Basic Information</Typography.Title>
    <Field
      id="facility_type"
      name="facility_type"
      label="Facility Type"
      component={renderConfig.SELECT}
      validate={[requiredList]}
    />
    <Field
      id="tailings_storage_facility_type"
      name="proponent_project_id"
      label="Tailings Storage Facility Type"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="mines_act_permit_number"
      name="mines_act_permit_number"
      label="Mines Act Permit Number"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="mine_tailings_storage_facility_name"
      name="mine_tailings_storage_facility_name"
      label="Tailing Storage Facility Name"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Row gutter={16}>
      <Col span={12}>
        <Field
          id="latitude"
          name="latitude"
          label="Latitude"
          component={renderConfig.FIELD}
          validate={[maxLength(300)]}
        />
      </Col>
      <Col span={12}>
        <Field
          id="longitude"
          name="longitude"
          label="Longitude"
          component={renderConfig.FIELD}
          validate={[maxLength(300)]}
        />
      </Col>
    </Row>
    <Field
      id="consequence_classification_status_code"
      name="consequence_classification_status_code"
      label="Consequence Classification"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="tsf_operating_status_code"
      name="tsf_operating_status_code"
      label="Operating Status"
      component={renderConfig.SELECT}
      validate={[requiredList]}
    />
    <Field
      id="independent_tailings_review_board_member"
      name="independent_tailings_review_board_member"
      label="Independent Tailings Review Board Member"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
  </>
);

BasicInformation.propTypes = propTypes;

export default BasicInformation;
