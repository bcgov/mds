import React from "react";
import PropTypes from "prop-types";
import { Field } from "@mds/common/components/forms/form";
import { Button, Col, Row } from "antd";
import { required, requiredList } from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import { resetForm } from "@mds/common/redux/utils/helpers";

const propTypes = {
  mines: CustomPropTypes.options.isRequired,
  minespaceUserEmailHash: PropTypes.objectOf(PropTypes.any).isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

export const AddMinespaceUser = (props) => {
  const minespaceUserNotExists = (value) =>
    value && !(value in props.minespaceUserEmailHash)
      ? undefined
      : "A user with this email already exists";

  return (
    <FormWrapper
      name={FORM.ADD_MINESPACE_USER}
      onSubmit={props.onSubmit}
      initialValues={{ proponent_mine_access: [] }}
      reduxFormConfig={{
        touchOnBlur: false,
        onSubmitSuccess: resetForm(FORM.ADD_MINESPACE_USER)
      }}
    >
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Field
              id="bceid_username"
              name="bceid_username"
              label="BCeID username"
              placeholder="Please enter a bceid in the format of user@bceid"
              component={RenderField}
              required
              validate={[required, minespaceUserNotExists]}
              allowClear
            />
          </Col>
          <Col span={24}>
            <Field
              id="mine_guids"
              name="mine_guids"
              label="Mines"
              placeholder="Select the mines this user can access"
              component={renderConfig.MULTI_SELECT}
              data={props.mines}
              onChange={props.handleChange}
              onSearch={props.handleSearch}
              required
              validate={[requiredList]}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <Button className="full-mobile" type="primary" htmlType="submit">
            Create Proponent
          </Button>
        </div>
      </Col>
    </FormWrapper>
  )
};

AddMinespaceUser.propTypes = propTypes;

export default AddMinespaceUser;
