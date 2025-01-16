import React, { useState } from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { compose } from "redux";
import { connect } from "react-redux";
import { Button, Col, Row, Alert } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { getGenerateDocumentFormField } from "@/components/common/GenerateDocumentFormField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  documentType: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  preview: PropTypes.func.isRequired,
  previewGenerating: PropTypes.bool.isRequired,
  additionalTitle: PropTypes.string,
  disabled: PropTypes.bool,
  allowDocx: PropTypes.bool,
  allCurrentValues: PropTypes.arrayOf(PropTypes.any).isRequired,
  initialValues: PropTypes.any,
};

const defaultProps = {
  additionalTitle: "",
  disabled: false,
  allowDocx: false,
};

const fileTypes = [
  {
    label: ".PDF",
    value: "PDF",
  },
  {
    label: ".DOCX",
    value: "DOCX",
  },
];

const createFields = (fields) => (
  <div>
    {fields &&
      fields.length > 0 &&
      fields
        .filter((field) => !field["read-only"])
        .map((field) => (
          <Row key={field.id}>
            <Col span={24}>
              {getGenerateDocumentFormField(field)}
            </Col>
          </Row>
        ))}
  </div>
);

export const GenerateDocumentForm = (props) => {
  const [fileType, setFileType] = useState("PDF");

  return (
    <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
      isModal
      name={FORM.GENERATE_DOCUMENT}
      reduxFormCondig={{
        touchOnBlur: true,
        onSubmitSuccess: resetForm(FORM.GENERATE_DOCUMENT),
      }}
    >
      {props.allowDocx && (
        <div>
          <Row key="fileType">
            <Col span={24}>
              <>
                <Field
                  id="file_type"
                  name="file_type"
                  label="Select the file type for this document"
                  data={fileTypes}
                  component={RenderSelect}
                  onChange={(value) => setFileType(value)}
                />
                {fileType === "DOCX" && (
                  <>
                    <Alert
                      description="If you plan to edit this document, please ensure that you do not change any vital information that would contradict BC government legislation pertaining to privacy or financial information."
                      type="warning"
                      showIcon
                    />
                    <br />
                  </>
                )}
              </>
            </Col>
          </Row>
        </div>
      )}
      <Row gutter={16}>
        <Col span={24}>{createFields(props.documentType.document_template.form_spec)}</Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <Button
          className="full-mobile"
          type="secondary"
          loading={props.previewGenerating}
          onClick={() => {
            props.preview(props.documentType, Object.assign({}, props.allCurrentValues));
          }}
        >
          Preview Document
        </Button>
        <RenderSubmitButton buttonText={`Generate ${props.documentType.description} ${props.additionalTitle}`} buttonProps={{ disabled: props.disabled }} />
      </div>
    </FormWrapper>
  );
};

GenerateDocumentForm.propTypes = propTypes;
GenerateDocumentForm.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  allCurrentValues: getFormValues(FORM.GENERATE_DOCUMENT)(state),
});

export default compose(
  connect(mapStateToProps, null)
)(GenerateDocumentForm);
