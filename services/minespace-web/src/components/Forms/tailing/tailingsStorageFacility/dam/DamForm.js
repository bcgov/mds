import {
  CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
  DAM_OPERATING_STATUS,
  DAM_TYPES,
} from "@common/constants/strings";
import { Col, Popconfirm, Row, Typography } from "antd";
import {
  decimalPlaces,
  lat,
  lon,
  maxDigits,
  maxLength,
  number,
  required,
  requiredList,
  validateSelectOptions,
} from "@common/utils/Validate";
import { useHistory, useParams } from "react-router-dom";

import { EDIT_TAILINGS_STORAGE_FACILITY } from "@/constants/routes";
import { Field } from "redux-form";
import PropTypes from "prop-types";
import React from "react";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  tsf: PropTypes.objectOf(PropTypes.any).isRequired,
};

const DamForm = (props) => {
  const { tsf } = props;
  const history = useHistory();
  const { tailingsStorageFacilityGuid, mineGuid } = useParams();
  const returnUrl = EDIT_TAILINGS_STORAGE_FACILITY.dynamicRoute(
    tailingsStorageFacilityGuid,
    mineGuid,
    "associated-dams"
  );

  const handleBack = () => {
    history.push(returnUrl);
  };

  return (
    <div>
      <div className="margin-large--bottom">
        <Typography.Title level={3}>Associated Dams</Typography.Title>
        <Popconfirm
          title={`Are you sure you want to cancel ${
            tailingsStorageFacilityGuid ? "updating this" : "creating a new"
          } dam?
        All unsaved data on this page will be lost.`}
          cancelText="No"
          okText="Yes"
          placement="right"
          onConfirm={handleBack}
        >
          <Typography.Link>
            Return to all Associated Dams of {tsf.mine_tailings_storage_facility_name}.
          </Typography.Link>
        </Popconfirm>
      </div>

      <Field
        id="dam_type"
        name="dam_type"
        label="Dam Type"
        component={renderConfig.SELECT}
        data={DAM_TYPES}
        validate={[requiredList, validateSelectOptions(DAM_TYPES)]}
      />
      <Field
        id="dam_name"
        name="dam_name"
        label="Dam Name"
        component={renderConfig.FIELD}
        validate={[required, maxLength(60)]}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Field
            id="latitude"
            name="latitude"
            label="Latitude"
            component={renderConfig.FIELD}
            validate={[required, lat]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="longitude"
            name="longitude"
            label="Longitude"
            component={renderConfig.FIELD}
            validate={[required, lon]}
          />
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
        validate={[required, decimalPlaces(2), number, maxDigits(10)]}
      />
      <Field
        id="current_dam_height"
        name="current_dam_height"
        label="Current Dam Height (downstream toe to crest in meters)"
        component={renderConfig.FIELD}
        validate={[required, decimalPlaces(2), number, maxDigits(10)]}
      />
      <Field
        id="current_elevation"
        name="current_elevation"
        label="Current Elevation (elevation at the top of the dam in meters)"
        component={renderConfig.FIELD}
        validate={[required, decimalPlaces(2), number, maxDigits(10)]}
      />
      <Field
        id="max_pond_elevation"
        name="max_pond_elevation"
        label="Maximum Pond Elevation (meters above sea level recorded in the previous 12 months)"
        component={renderConfig.FIELD}
        validate={[required, decimalPlaces(2), number, maxDigits(10)]}
      />
      <Field
        id="min_freeboard_required"
        name="min_freeboard_required"
        label="Minimum Freeboard Required (water surface to the crest of the dam, in meters)"
        component={renderConfig.FIELD}
        validate={[required, decimalPlaces(2), number, maxDigits(10)]}
      />
    </div>
  );
};

DamForm.propTypes = propTypes;

export default DamForm;
