import React, { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, getFormValues, change, touch } from "redux-form";
import { Row, Col, Button, Typography } from "antd";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { REPORT_REGULATORY_AUTHORITY_CODES, REPORT_REGULATORY_AUTHORITY_ENUM } from "@mds/common";
import {
  required,
  maxLength,
  digitCharactersOnly,
  requiredRadioButton,
  protocol,
} from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { getComplianceCodes } from "@mds/common/redux/selectors/staticContentSelectors";
import {
  formatComplianceCodeArticleNumber,
  stripParentheses,
} from "@mds/common/redux/utils/helpers";

const ComplianceCodeViewEditForm: FC<any> = ({ initialValues = {}, isEditMode = true }) => {
  const dispatch = useDispatch();
  const complianceCodes = useSelector(getComplianceCodes);
  const formValues = useSelector(getFormValues(FORM.ADD_COMPLIANCE_CODE)) ?? {};
  const { section, sub_section, paragraph, sub_paragraph } = formValues;

  const uniqueArticleNumbers = complianceCodes.map((code) => {
    const articleNumber = formatComplianceCodeArticleNumber(code);
    return stripParentheses(articleNumber);
  });

  const generateArticleNumber = () => {
    const articleNumber = [section, sub_section, paragraph, sub_paragraph]
      .filter(Boolean)
      .join(".");
    dispatch(change(FORM.ADD_COMPLIANCE_CODE, "articleNumber", articleNumber));
    dispatch(touch(FORM.ADD_COMPLIANCE_CODE, "articleNumber"));
  };

  const validateUniqueArticleNumber = (value) => {
    return value && uniqueArticleNumbers.includes(stripParentheses(value))
      ? "Must select a unique article number"
      : undefined;
  };

  useEffect(() => {
    generateArticleNumber();
  }, [section, sub_section, paragraph, sub_paragraph]);

  return (
    <div>
      <FormWrapper
        name={FORM.ADD_COMPLIANCE_CODE}
        initialValues={initialValues}
        onSubmit={(values) => console.log(values)}
        isEditMode={isEditMode}
        isModal={true}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Typography.Text strong>HSRC Details</Typography.Text>
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Section"
              required
              validate={[required, digitCharactersOnly, maxLength(5)]}
              name="section"
              component={RenderField}
            />
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Subsection"
              validate={[digitCharactersOnly, maxLength(6)]}
              name="sub_section"
              component={RenderField}
            />
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Paragraph"
              validate={[digitCharactersOnly, maxLength(4)]}
              name="paragraph"
              component={RenderField}
            />
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Subparagraph"
              validate={[maxLength(20)]}
              name="sub_paragraph"
              component={RenderField}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24} className="hide-required-indicator">
            <Field
              id="articleNumber"
              name="articleNumber"
              label="Section Displayed"
              validate={[validateUniqueArticleNumber]}
              disabled
              component={RenderField}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Field
              name="effective_date"
              label="Date Active"
              required
              validate={[required]}
              component={RenderDate}
              placeholder="Select date"
            />
          </Col>
          <Col span={12}>
            <Field
              name="expiry_date"
              label="Date Expire"
              component={RenderDate}
              placeholder="Select date"
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Field
              name="description"
              label="Description"
              component={RenderField}
              required
              validate={[required, maxLength(100)]}
            />
          </Col>
          <Col span={24}>
            <Field
              name="long_description"
              label="Long Description"
              component={RenderAutoSizeField}
              required
              validate={[required, maxLength(3000)]}
              maximumCharacters={3000}
            />
          </Col>
          <Col span={24}>
            <Typography.Text strong>Regulatory Authority</Typography.Text>
          </Col>
          <Col span={24}>
            <Field
              name="cim_or_cpo"
              label="Who is the report for?"
              component={RenderRadioButtons}
              required
              validate={[requiredRadioButton]}
              isVertical
              customOptions={[
                {
                  label: REPORT_REGULATORY_AUTHORITY_ENUM.CPO,
                  value: REPORT_REGULATORY_AUTHORITY_CODES.CPO,
                },
                {
                  label: REPORT_REGULATORY_AUTHORITY_ENUM.CIM,
                  value: REPORT_REGULATORY_AUTHORITY_CODES.CIM,
                },
                {
                  label: REPORT_REGULATORY_AUTHORITY_CODES.BOTH,
                  value: REPORT_REGULATORY_AUTHORITY_CODES.BOTH,
                },
                {
                  label: REPORT_REGULATORY_AUTHORITY_CODES.NONE,
                  value: REPORT_REGULATORY_AUTHORITY_CODES.NONE,
                },
              ]}
            />
          </Col>
          <Col span={24}>
            <Field
              name="help_reference_link"
              label="Resource Information Link"
              component={RenderField}
              validate={[protocol]}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]} justify="end">
          <RenderCancelButton />
          {isEditMode && (
            <Button htmlType="submit" type="primary">
              Save Code
            </Button>
          )}
        </Row>
      </FormWrapper>
    </div>
  );
};

export default ComplianceCodeViewEditForm;
