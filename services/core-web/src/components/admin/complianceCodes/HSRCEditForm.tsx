import React from "react";
import { Field } from "@mds/common/components/forms/form";
import { Alert, Row, Col, Typography } from "antd";
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
import {
  formatComplianceCodeArticleNumber,
  stripParentheses,
} from "@mds/common/redux/utils/helpers";
import { IComplianceArticle } from "@mds/common/interfaces";
import { REPORT_REGULATORY_AUTHORITY_CODES, REPORT_REGULATORY_AUTHORITY_ENUM } from "@mds/common/constants/enums";

export interface HSRCEditFormProps {
  complianceCodes: IComplianceArticle[];
}

export const HSRCEditForm = (props: HSRCEditFormProps) => {
  const uniqueArticleNumbers = props.complianceCodes.map((code) => {
    const articleNumber = formatComplianceCodeArticleNumber(code);
    return stripParentheses(articleNumber);
  });

  const validateUniqueArticleNumber = (value) => {
    return value && uniqueArticleNumbers.includes(stripParentheses(value))
      ? "Must select a unique article number"
      : undefined;
  };

  return (
    <>
      <Row gutter={[16, 16]} className="form-row-margin">
        <Col span={24}>
          <Alert
            message="Before you continue"
            showIcon
            type="warning"
            description="If this HSRC clause includes a reporting requirement, ensure the report has already been created.
            Reports are managed seperately and must exist before they can be linked to a code clause."
          />
        </Col>
      </Row >
      <br />
      <Row gutter={[16, 16]} className="form-row-margin">
        <Col span={24}>
          <Typography.Text strong>HSRC Details</Typography.Text>
        </Col>
        <Col md={5} sm={10}>
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
        <Col md={7} sm={14}>
          <Field
            label="Subparagraph"
            validate={[maxLength(20)]}
            name="sub_paragraph"
            component={RenderField}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="form-row-margin">
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
      <Row gutter={[16, 16]} className="form-row-margin">
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
            label="Expiry Date"
            component={RenderDate}
            placeholder="Select date"
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Field
            name="description"
            label="Clause Heading"
            placeholder="Enter the heading the appears above the clause text in the HSRC (for example: 'Acquisition of a mine')"
            // labelSubtitle={(<p><i>Enter the heading the appears above the clause text in the HSRC (for example: 'Acquisition of a mine')</i></p>)}
            component={RenderAutoSizeField}
            required
            validate={[required, maxLength(80)]}
            maximumCharacters={80}
          />
        </Col>
        <Col span={24}>
          <Field
            name="long_description"
            label="Clause Text"
            placeholder="Enter the HSRC wording that applies to this specific section, subsection, paragraph, or subparagraph.This should reflect the wording of the Code, not a summary."
            // labelSubtitle={(<p><i>Enter the HSRC wording that applies to this specific section, subsection, paragraph, or subparagraph.
            // This should reflect the wording of the Code, not a summary."</i></p>)}
            component={RenderAutoSizeField}
            required
            validate={[required, maxLength(3000)]}
            maximumCharacters={3000}
          />
        </Col>
        <Col span={24}>
          <Field
            name="cim_or_cpo"
            label="Regulatory Authority"
            labelSubtitle={(<p><i>Select the regulatory authority that has statutory responsibility for this HSRC clause.
              This is used to determine associated reporting and review requirements</i></p>)}
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
            label="External Guidance Link"
            labelSubtitle={(<p><i>Add a public web link to guidance or reference material that supports interpretation or application of this clause, if available.</i></p>)}
            component={RenderAutoSizeField}
            validate={[protocol, maxLength(2000)]}
            maximumCharacters={2000}
          />
        </Col>
      </Row>
    </>
  );
};
