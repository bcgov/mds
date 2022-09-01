import React from "react";
import { Col, Row, Typography } from "antd";
import { Field } from "redux-form";
import {
  maxLength,
  requiredList,
  lat,
  lon,
  required,
  validateSelectOptions,
} from "@common/utils/Validate";
import {
  FACILITY_TYPES,
  TSF_TYPES,
  STORAGE_LOCATION,
  TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD,
  TSF_OPERATING_STATUS_CODE,
  CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
} from "@common/constants/strings";
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
      data={FACILITY_TYPES}
      validate={[requiredList, validateSelectOptions(FACILITY_TYPES)]}
    />
    <Field
      id="mines_act_permit_no"
      name="mines_act_permit_no"
      label="Mines Act Permit Number"
      component={renderConfig.FIELD}
      validate={[maxLength(300), required]}
    />
    <Field
      id="tailings_storage_facility_type"
      name="tailings_storage_facility_type"
      label="Tailings Storage Facility Type"
      component={renderConfig.SELECT}
      validate={[requiredList, validateSelectOptions(TSF_TYPES)]}
      data={TSF_TYPES}
    />
    <Field
      id="storage_location"
      name="storage_location"
      label="Underground or Above Ground?"
      component={renderConfig.SELECT}
      data={STORAGE_LOCATION}
      validate={[requiredList, validateSelectOptions(STORAGE_LOCATION)]}
    />
    <Field
      id="mine_tailings_storage_facility_name"
      name="mine_tailings_storage_facility_name"
      label="Facility Name"
      component={renderConfig.FIELD}
      validate={[maxLength(300), required]}
    />
    <Row gutter={16}>
      <Col span={12}>
        <Field
          id="latitude"
          name="latitude"
          label="Latitude"
          component={renderConfig.FIELD}
          validate={[lat, required]}
        />
      </Col>
      <Col span={12}>
        <Field
          id="longitude"
          name="longitude"
          label="Longitude"
          component={renderConfig.FIELD}
          validate={[lon, required]}
        />
      </Col>
    </Row>
    <Field
      id="consequence_classification_status_code"
      name="consequence_classification_status_code"
      label="Consequence Classification"
      component={renderConfig.SELECT}
      data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
      validate={[requiredList, validateSelectOptions(CONSEQUENCE_CLASSIFICATION_STATUS_CODE)]}
    />
    <Field
      id="tsf_operating_status_code"
      name="tsf_operating_status_code"
      label="Operating Status"
      data={TSF_OPERATING_STATUS_CODE}
      component={renderConfig.SELECT}
      validate={[requiredList, validateSelectOptions(TSF_OPERATING_STATUS_CODE)]}
    />
    <Field
      id="itrb_exemption_status_code"
      name="itrb_exemption_status_code"
      label="Independent Tailings Review Board Member"
      component={renderConfig.SELECT}
      data={TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD}
      validate={[maxLength(300), required]}
    />
  </>
);

BasicInformation.propTypes = propTypes;

export default BasicInformation;
