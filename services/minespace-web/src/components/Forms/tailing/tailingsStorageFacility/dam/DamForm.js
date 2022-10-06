import {
  CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
  DAM_OPERATING_STATUS,
  DAM_TYPES,
} from "@common/constants/strings";
import { Col, Row, Typography } from "antd";
import { requiredList, validateSelectOptions } from "@common/utils/Validate";

import { Field } from "redux-form";
import React from "react";
import { renderConfig } from "@/components/common/config";

const DamForm = () => {
  return (
    <div>
      <Typography.Title level={3}>Dam</Typography.Title>
      <Field
        id="dam_type"
        name="dam_type"
        label="Dam Type"
        component={renderConfig.SELECT}
        data={DAM_TYPES}
      />
      <Field id="dam_name" name="dam_name" label="Dam Name" component={renderConfig.FIELD} />
      <Row gutter={16}>
        <Col span={12}>
          <Field id="latitude" name="latitude" label="Latitude" component={renderConfig.FIELD} />
        </Col>
        <Col span={12}>
          <Field id="longitude" name="longitude" label="Longitude" component={renderConfig.FIELD} />
        </Col>
      </Row>
      <Field
        id="operating_status"
        name="operating_status"
        label="Operating Status"
        component={renderConfig.SELECT}
        data={DAM_OPERATING_STATUS}
        validate={[requiredList, validateSelectOptions(DAM_OPERATING_STATUS)]}
      />
      <Field
        id="consequence_classification"
        name="consequence_classification"
        label="Dam Consequence Classification"
        component={renderConfig.SELECT}
        data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
        validate={[requiredList, validateSelectOptions(CONSEQUENCE_CLASSIFICATION_STATUS_CODE)]}
      />
      <Field
        id="permitted_dam_crest_elevation"
        name="permitted_dam_crest_elevation"
        label="Permitted Dam Crest Elevation (meters above sea level)"
        component={renderConfig.FIELD}
      />
      <Field
        id="current_dam_height"
        name="current_dam_height"
        label="Current Dam Height (downstream toe to crest in meters)"
        component={renderConfig.FIELD}
      />
      <Field
        id="current_elevation"
        name="current_elevation"
        label="Current Elevation (elevation at the top of the dam in meters)"
        component={renderConfig.FIELD}
      />
      <Field
        id="max_pond_elevation"
        name="max_pond_elevation"
        label="Maximum Pond Elevation (meters above sea level recorded in the previous 12 months)"
        component={renderConfig.FIELD}
      />
      <Field
        id="min_freeboard_required"
        name="min_freeboard_required"
        label="Minimum Freeboard Required (water surface to the crest of the dam, in meters)"
        component={renderConfig.FIELD}
      />
    </div>
  );
};

export default DamForm;
