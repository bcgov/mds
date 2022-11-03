import {
  CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
  FACILITY_TYPES,
  STORAGE_LOCATION,
  TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD,
  TSF_OPERATING_STATUS_CODE,
  TSF_TYPES,
} from "@common/constants/strings";
import { Col, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import {
  lat,
  lon,
  maxLength,
  required,
  requiredList,
  validateSelectOptions,
} from "@common/utils/Validate";

import { Field } from "redux-form";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { formatDateTime } from "@common/utils/helpers";
import { getPermits } from "@common/selectors/permitSelectors";
import { getTsf } from "@common/selectors/tailingsSelectors";

const propTypes = {
  permits: PropTypes.arrayOf(PropTypes.object).isRequired,
  showUpdateTimestamp: PropTypes.bool.isRequired,
  renderConfig: PropTypes.objectOf(PropTypes.any).isRequired,
  tsf: PropTypes.objectOf(PropTypes.any).isRequired,
  viewOnly: PropTypes.bool,
};

const defaultProps = {
  viewOnly: false,
};

export const BasicInformation = (props) => {
  const { permits, renderConfig, viewOnly = false } = props;
  const [permitOptions, setPermitOptions] = useState([]);

  useEffect(() => {
    if (permits.length > 0) {
      setPermitOptions(
        permits.map((permit) => ({
          label: permit.permit_no,
          value: permit.permit_no,
        }))
      );
    }
  }, [permits]);
  return (
    <>
      <Row type="flex" justify="space-between">
        <Typography.Title level={3}>Basic Information</Typography.Title>
        {props.showUpdateTimestamp && props.tsf?.update_timestamp && (
          <Typography.Paragraph style={{ textAlign: "right" }}>
            <b>Last Updated</b>
            <br />
            {formatDateTime(props.tsf.update_timestamp)}
          </Typography.Paragraph>
        )}
      </Row>
      <Field
        id="facility_type"
        name="facility_type"
        label="Facility Type"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        data={FACILITY_TYPES}
        validate={[requiredList, validateSelectOptions(FACILITY_TYPES)]}
      />
      <Field
        label="Mines Act Permit Number"
        id="mines_act_permit_no"
        name="mines_act_permit_no"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        validate={[requiredList, validateSelectOptions(permitOptions)]}
        data={permitOptions}
      />
      <Field
        id="tailings_storage_facility_type"
        name="tailings_storage_facility_type"
        label="Tailings Storage Facility Type"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        validate={[requiredList, validateSelectOptions(TSF_TYPES)]}
        data={TSF_TYPES}
      />
      <Field
        id="storage_location"
        name="storage_location"
        label="Underground or Above Ground?"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        data={STORAGE_LOCATION}
        validate={[requiredList, validateSelectOptions(STORAGE_LOCATION)]}
      />
      <Field
        id="mine_tailings_storage_facility_name"
        name="mine_tailings_storage_facility_name"
        label="Facility Name"
        component={renderConfig.FIELD}
        disabled={viewOnly}
        validate={[maxLength(60), required]}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Field
            id="latitude"
            name="latitude"
            label="Latitude"
            component={renderConfig.FIELD}
            disabled={viewOnly}
            validate={[lat, required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="longitude"
            name="longitude"
            label="Longitude"
            component={renderConfig.FIELD}
            disabled={viewOnly}
            validate={[lon, required]}
          />
        </Col>
      </Row>
      <Field
        id="consequence_classification_status_code"
        name="consequence_classification_status_code"
        label="Consequence Classification"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
        validate={[requiredList, validateSelectOptions(CONSEQUENCE_CLASSIFICATION_STATUS_CODE)]}
      />
      <Field
        id="tsf_operating_status_code"
        name="tsf_operating_status_code"
        label="Operating Status"
        data={TSF_OPERATING_STATUS_CODE}
        component={renderConfig.SELECT}
        disabled={viewOnly}
        validate={[requiredList, validateSelectOptions(TSF_OPERATING_STATUS_CODE)]}
      />
      <Field
        id="itrb_exemption_status_code"
        name="itrb_exemption_status_code"
        label="Independent Tailings Review Board Member"
        component={renderConfig.SELECT}
        disabled={viewOnly}
        data={TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD}
        validate={[maxLength(300), required]}
      />
    </>
  );
};

BasicInformation.propTypes = propTypes;
BasicInformation.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  permits: getPermits(state),
  tsf: getTsf(state),
});

export default connect(mapStateToProps)(BasicInformation);
