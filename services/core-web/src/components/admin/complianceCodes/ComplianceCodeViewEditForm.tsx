import React, { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getFormValues, change, touch } from "redux-form";
import { Row, Button, Steps } from "antd";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { IComplianceArticle, REPORT_REGULATORY_AUTHORITY_CODES } from "@mds/common";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import {
  createComplianceCode,
  formatCode,
  getActiveComplianceCodesList,
} from "@mds/common/redux/slices/complianceCodesSlice";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { HSRCEditForm } from "./HSRCEditForm";
import { ReportEditForm } from "./ReportEditForm";

const ComplianceCodeViewEditForm: FC<{
  initialValues: IComplianceArticle;
  isEditMode: boolean;
  onSave: (values: IComplianceArticle) => void | Promise<void>;
}> = ({ initialValues = {}, isEditMode = true, onSave = null }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch();
  const complianceCodes = useSelector(getActiveComplianceCodesList);
  const formValues = useSelector(getFormValues(FORM.ADD_COMPLIANCE_CODE)) ?? {};
  const { section, sub_section, paragraph, sub_paragraph } = formValues;

  const generateArticleNumber = () => {
    const articleNumber = [section, sub_section, paragraph, sub_paragraph]
      .filter(Boolean)
      .join(".");
    dispatch(change(FORM.ADD_COMPLIANCE_CODE, "articleNumber", articleNumber));
    dispatch(touch(FORM.ADD_COMPLIANCE_CODE, "articleNumber"));
  };

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const previous = () => {
    setCurrentStep(currentStep - 1);
  };

  useEffect(() => {
    if (section) {
      generateArticleNumber();
    }
  }, [section, sub_section, paragraph, sub_paragraph]);

  const steps = [
    {
      title: "HSRC Details",
      content: <HSRCEditForm complianceCodes={complianceCodes} />,
    },
    {
      title: "Report Details",
      content: (
        <ReportEditForm complianceCodes={complianceCodes} isEditMode={isEditMode}></ReportEditForm>
      ),
    },
  ];

  const handleSubmit = async (values: IComplianceArticle) => {
    if (currentStep === steps.length - 1) {
      const cim_or_cpo =
        values.cim_or_cpo !== REPORT_REGULATORY_AUTHORITY_CODES.NONE ? values.cim_or_cpo : null;
      const payload = { ...values, article_act_code: "HSRCM", cim_or_cpo };
      dispatch(createComplianceCode(payload)).then((resp) => {
        if (resp.payload) {
          if (onSave) {
            onSave(formatCode(resp.payload));
          }
          dispatch(closeModal());
        }
      });
    } else {
      next();
    }
  };

  return (
    <div>
      <FormWrapper
        name={FORM.ADD_COMPLIANCE_CODE}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isEditMode={isEditMode}
        isModal={true}
      >
        <Row>
          <Steps current={currentStep}>
            {steps.map((step) => (
              <Steps.Step key={step.title} title={step.title} />
            ))}
          </Steps>

          <Row style={{ marginTop: "16px", width: "100%" }}>{steps[currentStep].content}</Row>
          <Row style={{ width: "100%" }} justify="end">
            <RenderCancelButton />
            {currentStep > 0 && (
              <Button className="full-mobile ant-btn-tertiary" onClick={previous} disabled={false}>
                Back
              </Button>
            )}

            {isEditMode ? (
              <RenderSubmitButton
                buttonText={currentStep === steps.length - 1 ? "Save Code" : "Continue"}
              />
            ) : (
              ""
            )}
            {!isEditMode && currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={next}>
                Continue
              </Button>
            ) : (
              ""
            )}
          </Row>
        </Row>
      </FormWrapper>
    </div>
  );
};

export default ComplianceCodeViewEditForm;
