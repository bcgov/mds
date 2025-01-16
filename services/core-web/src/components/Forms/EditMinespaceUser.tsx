import React, { FC } from "react";
import { Field } from "redux-form";
import { Button, Col, Row } from "antd";
import { requiredList } from "@mds/common/redux/utils/Validate";
import { nullableStringSorter, resetForm } from "@common/utils/helpers";
import RenderField from "@mds/common/components/forms/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { IMine } from "@mds/common/interfaces";

interface EditMinespaceUserProps {
  mines: IMine[];
  initialValues: any;
  onSubmit: () => void;
  handleChange: () => void;
  handleSearch: (name: any) => void;
};

export const EditMinespaceUser: FC<EditMinespaceUserProps> = ({
  mines,
  onSubmit,
  handleChange,
  handleSearch,
  initialValues
}) => {
  const isModal = true; // currently no instance where it's not in a modal
  return (
    <FormWrapper onSubmit={onSubmit}
      name={FORM.EDIT_MINESPACE_USER}
      initialValues={initialValues}
      reduxFormConfig={{
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.EDIT_MINESPACE_USER),
      }}
    >
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Field
              id="email_or_username"
              name="email_or_username"
              label="Email/BCeID username"
              placeholder="Please enter a bceid in the format of user@bceid or a valid email address"
              component={RenderField}
              allowClear
            />
          </Col>
          <Col span={24}>
            <Field
              id="mine_guids"
              name="mine_guids"
              label="Mines"
              required
              placeholder="Select the mines this user can access"
              component={renderConfig.MULTI_SELECT}
              data={mines.sort(nullableStringSorter("label"))}
              onChange={handleChange}
              onSearch={handleSearch}
              validate={[requiredList]}
              props={{ isModal }}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" htmlType="submit">
            Edit Proponent
          </Button>
        </div>
      </Col>
    </FormWrapper>
  );
};
export default EditMinespaceUser;
