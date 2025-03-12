import React, { useEffect, FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFormValues, Field, change } from "@mds/common/components/forms/form";
import { Col, Row } from "antd";
import { currency, required, maxLength } from "@mds/common/redux/utils/Validate";
import { determineExemptionFeeStatus, currencyMask } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";

import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { IPermit } from "@mds/common/interfaces";

interface EditPermitFormProps {
  onSubmit: (values) => void | Promise<void>;
  title: string;
  initialValues: Partial<IPermit>;
}

export const EditPermitForm: FC<EditPermitFormProps> = ({
  onSubmit,
  title,
  initialValues
}) => {
  const dispatch = useDispatch();
  const permitStatusOptions = useSelector(getDropdownPermitStatusOptions);
  const exemptionFeeStatusDropDownOptions = useSelector(getExemptionFeeStatusDropDownOptions);
  const formValues = useSelector(getFormValues(FORM.EDIT_PERMIT)) as IPermit;

  useEffect(() => {
    const isExploration = initialValues.permit_no.charAt(1) === "X";
    const feeStatus = determineExemptionFeeStatus(
      formValues?.permit_status_code,
      initialValues.permit_prefix,
      initialValues.site_properties?.mine_tenure_type_code,
      isExploration,
      initialValues.site_properties?.mine_disturbance_code
    );
    dispatch(change(FORM.EDIT_PERMIT, "exemption_fee_status_code", feeStatus));
  }, [formValues?.permit_status_code]);

  return (
    <FormWrapper onSubmit={onSubmit}
      isModal
      initialValues={initialValues}
      name={FORM.EDIT_PERMIT}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            label="Permit status"
            placeholder="Select a permit status"
            component={RenderSelect}
            data={permitStatusOptions}
            required
            validate={[required]}
          />
          {(formValues?.permit_status_code === "C" ||
            formValues?.remaining_static_liability !== null) && (
              <Field
                id="remaining_static_liability"
                name="remaining_static_liability"
                label="Remaining outstanding liability amount (if any)"
                placeholder="$0.00"
                {...currencyMask}
                component={RenderField}
                validate={[currency]}
              />
            )}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_code"
            name="exemption_fee_status_code"
            label="Inspection Fee Status"
            placeholder="Inspection Fee Status will be automatically populated."
            showOptional={false}
            component={RenderSelect}
            disabled
            data={exemptionFeeStatusDropDownOptions}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_note"
            name="exemption_fee_status_note"
            label="Fee Exemption Note"
            component={RenderAutoSizeField}
            validate={[maxLength(300)]}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={title} />
      </div>
    </FormWrapper>
  );
};

export default EditPermitForm;
