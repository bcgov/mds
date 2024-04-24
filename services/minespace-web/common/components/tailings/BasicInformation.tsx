import {
  CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
  FACILITY_TYPES,
  IPermit,
  ITailingsStorageFacility,
  STORAGE_LOCATION,
  TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD,
  TSF_OPERATING_STATUS_CODE,
  TSF_TYPES,
} from "@mds/common";
import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import {
  lat,
  lon,
  lonNegative,
  maxLength,
  required,
  requiredList,
  validateSelectOptions,
} from "@common/utils/Validate";

import { Field } from "redux-form";
import { connect } from "react-redux";
import { formatDateTime } from "@common/utils/helpers";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getTsf } from "@mds/common/redux/selectors/tailingsSelectors";
import { RootState } from "@/App";
import TailingsDiffModal from "@mds/common/components/tailings/TailingsDiffModal";

interface BasicInformationProps {
  permits: IPermit[];
  showUpdateTimestamp: boolean;
  renderConfig: any;
  tsf: ITailingsStorageFacility;
  canEditTSF?: boolean;
  isEditMode: boolean;
}

export const BasicInformation: FC<BasicInformationProps> = (props) => {
  const { permits, renderConfig, canEditTSF = false, tsf, isEditMode } = props;
  const [permitOptions, setPermitOptions] = useState([]);
  const [diffModalOpen, setDiffModalOpen] = useState(false);

  const canEditTSFAndEditMode = canEditTSF && isEditMode;

  const statusCodeOptions =
    tsf?.tsf_operating_status_code === "CLO"
      ? [...TSF_OPERATING_STATUS_CODE, { value: "CLO", label: "Closed" }]
      : TSF_OPERATING_STATUS_CODE;

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
      {props.tsf?.update_timestamp && (
        <Row>
          <Col span={24}>
            <Typography.Paragraph>
              <Alert
                description={`Last Updated by ${props.tsf.update_user}  on ${formatDateTime(
                  props.tsf.update_timestamp
                )}`}
                showIcon
                message=""
                type="info"
                style={{ alignItems: "center" }}
                action={
                  <Button className="margin-large--left" onClick={() => setDiffModalOpen(true)}>
                    View History
                  </Button>
                }
              />
            </Typography.Paragraph>
          </Col>
        </Row>
      )}
      <Row>
        <Typography.Title level={3}>Basic Information</Typography.Title>
      </Row>
      <Field
        id="facility_type"
        name="facility_type"
        label="Facility Type *"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        data={FACILITY_TYPES}
        validate={[requiredList, validateSelectOptions(FACILITY_TYPES)]}
      />
      <Field
        label="Mines Act Permit Number *"
        id="mines_act_permit_no"
        name="mines_act_permit_no"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        validate={[requiredList, validateSelectOptions(permitOptions)]}
        data={permitOptions}
      />
      <Field
        id="tailings_storage_facility_type"
        name="tailings_storage_facility_type"
        label="Tailings Storage Facility Type *"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        validate={[requiredList, validateSelectOptions(TSF_TYPES)]}
        data={TSF_TYPES}
      />
      <Field
        id="storage_location"
        name="storage_location"
        label="Underground or Above Ground? *"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        data={STORAGE_LOCATION}
        validate={[requiredList, validateSelectOptions(STORAGE_LOCATION)]}
      />
      <Field
        id="mine_tailings_storage_facility_name"
        name="mine_tailings_storage_facility_name"
        label="Facility Name *"
        component={renderConfig.FIELD}
        disabled={!canEditTSFAndEditMode}
        validate={[maxLength(60), required]}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Field
            id="latitude"
            name="latitude"
            label="Latitude *"
            component={renderConfig.FIELD}
            disabled={!canEditTSFAndEditMode}
            validate={[lat, required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="longitude"
            name="longitude"
            label="Longitude *"
            component={renderConfig.FIELD}
            disabled={!canEditTSFAndEditMode}
            validate={[lonNegative, lon, required]}
          />
        </Col>
      </Row>
      <Field
        id="consequence_classification_status_code"
        name="consequence_classification_status_code"
        label="Consequence Classification *"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
        validate={[requiredList, validateSelectOptions(CONSEQUENCE_CLASSIFICATION_STATUS_CODE)]}
      />
      <Field
        id="tsf_operating_status_code"
        name="tsf_operating_status_code"
        label="Operating Status *"
        data={statusCodeOptions}
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        validate={[requiredList, validateSelectOptions(statusCodeOptions)]}
      />
      <Field
        id="itrb_exemption_status_code"
        name="itrb_exemption_status_code"
        label="Independent Tailings Review Board Member *"
        component={renderConfig.SELECT}
        disabled={!canEditTSFAndEditMode}
        data={TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD}
        validate={[maxLength(300), required]}
      />
      <TailingsDiffModal
        open={diffModalOpen}
        onCancel={() => setDiffModalOpen(false)}
        tsf={tsf}
        history={tsf.history}
      />
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  permits: getPermits(state),
  tsf: getTsf(state),
});

export default connect(mapStateToProps)(BasicInformation);
