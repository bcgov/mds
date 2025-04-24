
import { Alert, Button, Col, Row, Typography } from "antd";
import React, { FC, useEffect, useState } from "react";
import {
  lat,
  lon,
  lonNegative,
  maxLength,
  required,
  requiredList,
} from "@mds/common/redux/utils/Validate";
import { Field, getFormValues } from "@mds/common/components/forms/form";
import { formatDateTime, formatDateTimeUserTz } from "@mds/common/redux/utils/helpers";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { getTsfByGuid } from "@mds/common/redux/slices/tailingsSlice";
import TailingsDiffModal from "@mds/common/components/tailings/TailingsDiffModal";
import { IPermit, ITailingsStorageFacility, ITailingsStorageFacilityForm } from "@mds/common/interfaces";
import { CONSEQUENCE_CLASSIFICATION_STATUS_CODE, FACILITY_TYPES, STORAGE_LOCATION, TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD, TSF_OPERATING_STATUS_CODE, TSF_TYPES } from "@mds/common/constants/strings";
import RenderSelect from "../forms/RenderSelect";
import RenderField from "../forms/RenderField";
import { useAppSelector } from "@mds/common/redux/rootState";
import { FORM } from "@mds/common/constants/forms";

export interface BasicInformationProps {
  mineName: string;
  canEditTSF?: boolean;
  isEditMode: boolean;
}

const dateTransform = { transform: (dateString: string) => formatDateTimeUserTz(dateString) || null };

// Provide a mapping of the field names to the title and data for the field
// This is used to display the field names and values in a more user-friendly way in the history modal
// Defaults to Title Case for field names and keeping values as is for any fields where
// a field mapping is not provided
const historyDiffValueMapper = {
  facility_type: {
    title: "Facility Type",
    data: FACILITY_TYPES,
  },
  mines_act_permit_no: {
    title: "Mines Act Permit Number",
  },
  tailings_storage_facility_type: {
    title: "Tailings Storage Facility Type",
    data: TSF_TYPES,
  },
  storage_location: {
    title: "Underground or Above Ground?",
    data: STORAGE_LOCATION,
  },
  mine_tailings_storage_facility_name: {
    title: "Facility Name",
  },
  latitude: {
    title: "Latitude",
  },
  longitude: {
    title: "Longitude",
  },
  consequence_classification_status_code: {
    title: "Consequence Classification",
    data: CONSEQUENCE_CLASSIFICATION_STATUS_CODE,
  },
  tsf_operating_status_code: {
    title: "Operating Status",
    data: TSF_OPERATING_STATUS_CODE,
  },
  itrb_exemption_status_code: {
    title: "Independent Tailings Review Board Member",
    data: TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD,
  },
  create_timestamp: dateTransform,
  update_timestamp: dateTransform,
  is_draft: {
    title: "Submission Status",
    transform: (is_draft) => {
      if (typeof is_draft == "boolean") {
        return is_draft ? "Draft" : "Submitted"
      }
      return "No Data";
    }
  }
};

export const BasicInformation: FC<BasicInformationProps> = (props) => {
  const { canEditTSF = false, isEditMode, mineName } = props;
  const permits: IPermit[] = useAppSelector(getPermits);
  const formValues = useAppSelector(getFormValues(FORM.ADD_TAILINGS_STORAGE_FACILITY)) as ITailingsStorageFacilityForm;
  const tsf: ITailingsStorageFacility = useAppSelector(getTsfByGuid(formValues?.mine_guid, formValues?.mine_tailings_storage_facility_guid));
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
      {tsf?.update_timestamp && (
        <Row>
          <Col span={24}>
            <Typography.Paragraph>
              <Alert
                description={`Last Updated by ${tsf.update_user}  on ${formatDateTime(
                  tsf.update_timestamp
                )}`}
                showIcon
                message=""
                className="ant-alert-grey bullet"
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
        label="Facility Type"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        data={FACILITY_TYPES}
        required
        validate={[requiredList]}
      />
      <Field
        label="Mines Act Permit Number"
        id="mines_act_permit_no"
        name="mines_act_permit_no"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        required
        validate={[requiredList]}
        data={permitOptions}
      />
      <Field
        id="tailings_storage_facility_type"
        name="tailings_storage_facility_type"
        label="Tailings Storage Facility Type"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        required
        validate={[requiredList]}
        data={TSF_TYPES}
      />
      <Field
        id="storage_location"
        name="storage_location"
        label="Underground or Above Ground?"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        data={STORAGE_LOCATION}
        required
        validate={[requiredList]}
      />
      <Field
        id="mine_tailings_storage_facility_name"
        name="mine_tailings_storage_facility_name"
        label="Facility Name"
        component={RenderField}
        disabled={!canEditTSFAndEditMode}
        required
        validate={[maxLength(60), required]}
      />
      <Row gutter={16}>
        <Col span={12}>
          <Field
            id="latitude"
            name="latitude"
            label="Latitude"
            component={RenderField}
            disabled={!canEditTSFAndEditMode}
            required
            validate={[lat, required]}
          />
        </Col>
        <Col span={12}>
          <Field
            id="longitude"
            name="longitude"
            label="Longitude"
            component={RenderField}
            disabled={!canEditTSFAndEditMode}
            required
            validate={[lonNegative, lon, required]}
          />
        </Col>
      </Row>
      <Field
        id="consequence_classification_status_code"
        name="consequence_classification_status_code"
        label="Consequence Classification"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        data={CONSEQUENCE_CLASSIFICATION_STATUS_CODE}
        required
        validate={[requiredList]}
      />
      <Field
        id="tsf_operating_status_code"
        name="tsf_operating_status_code"
        label="Operating Status"
        data={statusCodeOptions}
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        required
        validate={[requiredList]}
      />
      <Field
        id="itrb_exemption_status_code"
        name="itrb_exemption_status_code"
        label="Independent Tailings Review Board Member"
        component={RenderSelect}
        disabled={!canEditTSFAndEditMode}
        data={TSF_INDEPENDENT_TAILINGS_REVIEW_BOARD}
        required
        validate={[maxLength(300), required]}
      />
      <TailingsDiffModal
        open={diffModalOpen}
        onCancel={() => setDiffModalOpen(false)}
        valueMapper={historyDiffValueMapper}
        mineName={mineName}
        tsfName={tsf?.mine_tailings_storage_facility_name}
        history={tsf?.history}
      />
    </>
  );
};

export default BasicInformation;
