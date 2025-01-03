import React, { FC, useState } from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { Field, getFormValues, isSubmitting } from "redux-form";
import { Button, Col, Popconfirm, Row, Form } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { getGenerateDocumentFormField } from "@/components/common/GenerateDocumentFormField";
import { IExplosivesPermitDocumentType, IParty } from "@mds/common";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface ExplosivesPermitDecisionFormProps {
  closeModal: any;
  previewDocument: any;
  inspectors: IParty[];
  submitting?: any;
  formValues?: any;
  documentType: IExplosivesPermitDocumentType;
  initialValues: any;
  onSubmit: any;
}

export const ExplosivesPermitDecisionForm: FC<ExplosivesPermitDecisionFormProps> = ({
  inspectors,
  onSubmit,
  initialValues,
  documentType,
  submitting,
  previewDocument,
  formValues,
  ...props
}) => {
  const [isPreviewingLetter, setIsPreviewingLetter] = useState(false);
  const [isPreviewingPermit, setIsPreviewingPermit] = useState(false);

  return (
    <FormWrapper
      name={FORM.EXPLOSIVES_PERMIT_DECISION}
      reduxFormConfig={{
        touchOnBlur: true,
        onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_DECISION),
      }}
      initialValues={initialValues} onSubmit={onSubmit}>
      <Row gutter={48}>
        <Col span={24}>
          <Field
            id="issuing_inspector_party_guid"
            name="issuing_inspector_party_guid"
            label="Issuing Inspector"
            component={renderConfig.GROUPED_SELECT}
            placeholder="Start typing the Issuing Inspector's name"
            required
            validate={[required]}
            data={inspectors}
          />
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue Date"
            component={renderConfig.DATE}
            required
            validate={[required]}
          />
          <Field
            id="expiry_date"
            name="expiry_date"
            label="Expiry Date"
            component={renderConfig.DATE}
            required
            validate={[required]}
          />
          {documentType.document_template.form_spec
            .filter((field) => !field["read-only"])
            .map((field) => (
              <Form.Item key={field.id}>{getGenerateDocumentFormField(field)}</Form.Item>
            ))}
        </Col>
      </Row>
      <div className="right center-mobile" style={{ paddingTop: "14px" }}>
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
          disabled={submitting}
        >
          <Button className="full-mobile" disabled={submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          onClick={() => {
            setIsPreviewingLetter(true);
            previewDocument("LET", formValues).finally(() => setIsPreviewingLetter(false));
          }}
          disabled={submitting}
          loading={isPreviewingLetter}
        >
          Preview Letter
        </Button>
        <Button
          className="full-mobile"
          onClick={() => {
            setIsPreviewingPermit(true);

            previewDocument("PER", formValues).finally(() => setIsPreviewingPermit(false));
          }}
          disabled={submitting}
          loading={isPreviewingPermit}
        >
          Preview Permit Certificate
        </Button>
        <Button type="primary" className="full-mobile" htmlType="submit" loading={submitting}>
          Issue Permit
        </Button>
      </div>
    </FormWrapper>
  );
};

const mapStateToProps = (state) => ({
  submitting: isSubmitting(FORM.EXPLOSIVES_PERMIT_DECISION)(state),
  formValues: getFormValues(FORM.EXPLOSIVES_PERMIT_DECISION)(state),
});

export default compose(
  connect(mapStateToProps)
)(ExplosivesPermitDecisionForm as any) as FC<ExplosivesPermitDecisionFormProps>;
