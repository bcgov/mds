import React from "react";
import { Button, Popconfirm, Typography } from "antd";
import { closeModal } from "@mds/common/redux/actions/modalActions";
import { useDispatch } from "react-redux";
import { Field } from "redux-form";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { maxLength } from "@mds/common/redux/utils/Validate";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { FORM } from "@mds/common";

const { Paragraph, Title } = Typography;

const RevokeCredentialModal = ({ submitting = false, onSubmit }) => {
  const dispatch = useDispatch();
  return (
    <div>
      <FormWrapper
        name={FORM.REVOKE_DIGITAL_CREDENTIAL}
        onSubmit={onSubmit}
        initialValues={{ comment: "" }}
      >
        <Title level={2}>Revoke Credential</Title>
        <Paragraph>
          Are you sure you want to revoke this digital credential? revoking this credential will
          require this credential be offered again to the proponent.
        </Paragraph>
        <Field
          id="comment"
          name="comment"
          label="Reason for revocation (this will be visible to proponents)"
          props={{ maximumCharacters: 500, minRows: 1 }}
          component={RenderAutoSizeField}
          validate={[maxLength(500)]}
        />
        <div className="right center-mobile" style={{ paddingTop: "14px" }}>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={() => dispatch(closeModal())}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile">Cancel</Button>
          </Popconfirm>
          <Button className="full-mobile" type="primary" htmlType="submit" loading={submitting}>
            Revoke Credential
          </Button>
        </div>
      </FormWrapper>
    </div>
  );
};

export default RevokeCredentialModal;
