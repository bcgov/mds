import React, { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, change, FormSection, getFormValues } from "redux-form";
import { Col, Row, Divider, Alert, Typography } from "antd";
import {
  required,
  dateNotInFuture,
  maxLength,
  requiredRadioButton,
  requiredList,
  number,
} from "@mds/common/redux/utils/Validate";
import { determineExemptionFeeStatus, currencyMask } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptions,
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getMineTenureTypeDropdownOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import { securityNotRequiredReasonOptions } from "@/constants/NOWConditions";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

interface AddPermitFormProps {
  onSubmit: (values) => void | Promise<void>;
  title: string;
  mine_guid: string;
}

const permitTypes = [
  {
    label: "Coal",
    value: "C",
  },
  {
    label: "Mineral",
    value: "M",
  },
  {
    label: "Placer",
    value: "P",
  },
  {
    label: "Sand & Gravel",
    value: "G",
  },
  {
    label: "Quarry",
    value: "Q",
  },
];

const mapApplicationTypeToTenureType = (permitPrefix: string) =>
  ({
    P: ["PLR"],
    C: ["COL"],
    M: ["MIN"],
    G: ["BCL", "PRL"],
    Q: ["BCL", "PRL", "MIN"],
    "": [],
  })[permitPrefix];

const validateBusinessRules = (values) => {
  let errors: any = {};
  if (values.is_exploration && !(values.permit_type === "C" || values.permit_type === "M")) {
    errors.permit_type = "Exploration is only valid for Coal and Placer permits";
  }
  return errors;
};

export const AddPermitForm: FC<AddPermitFormProps> = (props) => {
  const dispatch = useDispatch();
  const permitStatusOptions = useSelector(getDropdownPermitStatusOptions);
  const mineTenureTypes = useSelector(getMineTenureTypeDropdownOptions);
  const conditionalCommodityOptions = useSelector(getConditionalCommodityOptions);
  const conditionalDisturbanceOptions = useSelector(getConditionalDisturbanceOptionsHash);
  const exemptionFeeStatusDropDownOptions = useSelector(getExemptionFeeStatusDropDownOptions);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const formName = FORM.ADD_PERMIT;
  const formValues = useSelector(getFormValues(formName));
  const { site_properties, permit_type = "", permit_status_code = "", is_exploration = false, security_not_required } = formValues ?? {};
  const { mine_tenure_type_code, mine_disturbance_code } = site_properties ?? {};

  // File upload handlers
  const onFileLoad = (fileName, document_manager_guid) => {
    const newUploadedFiles = [{ fileName, document_manager_guid }, ...uploadedFiles];
    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  const onRemoveFile = (err, fileItem) => {
    const newUploadedFiles = uploadedFiles.filter((doc) => doc.document_manager_guid !== fileItem.serverId);
    setUploadedFiles(newUploadedFiles);
    dispatch(change(formName, "uploadedFiles", newUploadedFiles));
  };

  const handleChange = (value) => {
    if (value) {
      dispatch(change(formName, "security_not_required_reason", null));
    } else {
      dispatch(change(formName, "liability_adjustment", null));
      dispatch(change(formName, "security_received_date", null));
    }
  };

  useEffect(() => {
    dispatch(change(formName, "site_properties.mine_tenure_type_code", null));
    dispatch(change(formName, "site_properties.mine_disturbance_code", []));
    dispatch(change(formName, "site_properties.mine_commodity_code", []));
    dispatch(change(formName, "exemption_fee_status_code", null));
    dispatch(change(formName, "is_exploration", null));
  }, [permit_type]);

  useEffect(() => {
    if (permit_status_code && permit_type && mine_tenure_type_code) {
      const statusCode = determineExemptionFeeStatus(
        permit_status_code,
        permit_type,
        mine_tenure_type_code,
        is_exploration,
        mine_disturbance_code
      );

      dispatch(change(formName, "exemption_fee_status_code", statusCode));
    }

  }, [permit_status_code, permit_type, mine_tenure_type_code]);

  const isCoalOrMineral =
    mine_tenure_type_code === "COL" ||
    mine_tenure_type_code === "MIN";

  const permitPrefixCoalOrMineral =
    permit_type === "C" || permit_type === "M";

  const permitPrefix = permit_type ?? null;

  return (
    <FormWrapper onSubmit={props.onSubmit} name={FORM.ADD_PERMIT}
      isModal
      reduxFormConfig={{
        validate: validateBusinessRules,
        touchOnBlur: false,
      }}
    >
      {(permitPrefixCoalOrMineral || is_exploration) && (
        <>
          <Alert
            className="quadrat"
            description="Ensure that you have correctly specified if it is an exploration permit or not. This cannot be changed once the permit has been issued."
            type="info"
            showIcon
          />
          <br />
        </>
      )}
      <Row gutter={48}>
        <Col md={12} sm={24} className="border--right--layout">
          <PartySelectField
            id="permittee_party_guid"
            name="permittee_party_guid"
            label="Permittee"
            partyLabel="permittee"
            required
            validate={[required]}
            allowAddingParties
          />
          <Field
            id="permit_type"
            name="permit_type"
            label="Permit Type"
            placeholder="Select a permit type"
            component={renderConfig.SELECT}
            required
            validate={[required]}
            data={permitTypes}
          />
          {(permitPrefixCoalOrMineral || is_exploration) && (
            <Field
              id="is_exploration"
              name="is_exploration"
              label="Exploration Permit"
              component={RenderRadioButtons}
              required
              validate={[requiredRadioButton]}
            />
          )}
          {permit_type &&
            <Typography.Paragraph>
              {permit_type}{is_exploration ? "X" : ""} -
            </Typography.Paragraph>
          }
          <Field
            id="permit_no"
            name="permit_no"
            label="Permit Number"
            required
            component={renderConfig.FIELD}
            validate={[required, maxLength(9)]}
          />
          <Field
            id="permit_status_code"
            name="permit_status_code"
            required
            label="Permit Status"
            placeholder="Select a permit status"
            component={renderConfig.SELECT}
            data={permitStatusOptions}
            validate={[required]}
          />
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue Date"
            required
            component={renderConfig.DATE}
            validate={[required, dateNotInFuture]}
          />
          <Field
            id="authorization_end_date"
            name="authorization_end_date"
            label="Authorization End Date"
            component={renderConfig.DATE}
            validate={permitPrefixCoalOrMineral ? [] : [required]}
            required={!permitPrefixCoalOrMineral}
          />
          <Divider />
          <Field
            label="Security Not Required"
            id="security_not_required"
            name="security_not_required"
            component={renderConfig.CHECKBOX}
            onChange={handleChange}
          />
          {security_not_required && (
            <Field
              id="security_not_required_reason"
              label="Reason"
              required
              name="security_not_required_reason"
              component={renderConfig.SELECT}
              placeholder="Select a reason"
              data={securityNotRequiredReasonOptions}
              disabled={!security_not_required}
              validate={[required]}
            />
          )}

          <Field
            label="Assessed Liability Adjustment"
            help="This amount will be added to the Total Assessed Liability amount for this permit.
            Changes to this value in Core will not be updated in MMS."
            id="liability_adjustment"
            name="liability_adjustment"
            component={renderConfig.FIELD}
            {...currencyMask}
            validate={[number]}
            disabled={security_not_required}
          />
          <Field
            label="Security Received"
            id="security_received_date"
            name="security_received_date"
            component={renderConfig.DATE}
            disabled={security_not_required}
          />
        </Col>

        <Col md={12} sm={24}>
          <FormSection name="site_properties">
            <Field
              label="Tenure"
              id="mine_tenure_type_code"
              name="mine_tenure_type_code"
              component={renderConfig.SELECT}
              required
              validate={[requiredList]}
              disabled={!permit_type}
              data={mineTenureTypes.filter(({ value }) =>
                mapApplicationTypeToTenureType(permitPrefix).includes(value)
              )}
            />
            <Field
              label="Commodity"
              id="mine_commodity_code"
              name="mine_commodity_code"
              component={renderConfig.MULTI_SELECT}
              data={
                mine_tenure_type_code
                  ? conditionalCommodityOptions[
                  mine_tenure_type_code
                  ]
                  : []
              }
            />
            <Field
              id="mine_disturbance_code"
              name="mine_disturbance_code"
              component={renderConfig.MULTI_SELECT}
              data={
                mine_tenure_type_code
                  ? conditionalDisturbanceOptions[
                  mine_tenure_type_code
                  ]
                  : []
              }
              label="Disturbance"
              required={isCoalOrMineral}
              validate={isCoalOrMineral ? [required] : []}
            />
          </FormSection>
          <Field
            id="exemption_fee_status_code"
            name="exemption_fee_status_code"
            label="Inspection Fee Status"
            placeholder="Inspection Fee Status will be automatically populated."
            component={renderConfig.SELECT}
            disabled
            data={exemptionFeeStatusDropDownOptions}
          />
          <Field
            id="exemption_fee_status_note"
            name="exemption_fee_status_note"
            label="Fee Exemption Note"
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[maxLength(300)]}
          />
          <Divider />
          <Field
            id="PermitDocumentFileUpload"
            name="PermitDocumentFileUpload"
            onFileLoad={onFileLoad}
            onRemoveFile={onRemoveFile}
            mineGuid={props.mine_guid}
            component={PermitAmendmentFileUpload}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
}

export default AddPermitForm;
