import React, { FC } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Row, Col, Button } from "antd";
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

const ComplianceCodeViewEditForm: FC<any> = ({ initialValues, isEditMode = true }) => {
  return (
    <div>
      <FormWrapper
        name="new-hsrc"
        initialValues={initialValues}
        onSubmit={(values) => console.log(values)}
        isEditMode={isEditMode}
      >
        <Row gutter={[16, 16]}>
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
              required
              validate={[digitCharactersOnly, maxLength(6)]}
              name="sub_section"
              component={RenderField}
            />
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Paragraph"
              required
              validate={[digitCharactersOnly, maxLength(4)]}
              name="paragraph"
              component={RenderField}
            />
          </Col>
          <Col md={6} sm={12}>
            <Field
              label="Subparagraph"
              required
              validate={[maxLength(20)]}
              name="sub_paragraph"
              component={RenderField}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Field
              id="articleNumber"
              name="articleNumber"
              label="Section Displayed"
              validate={[]}
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
        <Row gutter={[16, 16]}>
          <RenderCancelButton />
          <Button htmlType="submit">Save Code</Button>
        </Row>
      </FormWrapper>
    </div>
  );
};

export default ComplianceCodeViewEditForm;
