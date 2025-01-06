import React, { FC } from "react";
import { Field, InjectedFormProps, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row } from "antd";
import { requiredList } from "@common/utils/Validate";
import { nullableStringSorter, resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { IMine } from "@mds/common/interfaces";

interface EditMinespaceUserProps{
  mines: IMine[];
  // eslint-disable-next-line react/no-unused-prop-types
  handleSubmit: () => void;
  handleChange: () => void;
  handleSearch: (name: any) => void;
};

export const EditMinespaceUser: FC<EditMinespaceUserProps & InjectedFormProps> = ({
  mines,
  handleSubmit,
  handleChange,
  handleSearch
}) => {
  const isModal = true; // currently no instance where it's not in a modal
  return (
    <Form layout="vertical" onSubmit={handleSubmit}>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Form.Item>
              <Field
                id="email_or_username"
                name="email_or_username"
                label="Email/BCeID username"
                placeholder="Please enter a bceid in the format of user@bceid or a valid email address"
                component={RenderField}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item>
              <Field
                id="mine_guids"
                name="mine_guids"
                label="Mines*"
                placeholder="Select the mines this user can access"
                component={renderConfig.MULTI_SELECT}
                data={mines.sort(nullableStringSorter("label"))}
                onChange={handleChange}
                onSearch={handleSearch}
                validate={[requiredList]}
                props={{ isModal }}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" htmlType="submit">
            Edit Proponent
          </Button>
        </div>
      </Col>
    </Form>
  );
};

export default reduxForm({
  form: FORM.EDIT_MINESPACE_USER,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_MINESPACE_USER),
})(EditMinespaceUser);
