import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export const TransferBondForm = (props) => (
  <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
    name={FORM.TRANSFER_BOND}
    reduxFormConfig={{
      touchOnBlur: false,
      onSubmitSuccess: resetForm(FORM.TRANSFER_BOND),
      enableReinitialize: true,
    }}
  >
    <Row>
      <Col span={24}>
        <Field
          id="permit_guid"
          name="permit_guid"
          label="Permit"
          required
          component={RenderSelect}
          data={props.permits.map((p) => {
            return { value: p.permit_guid, label: p.permit_no };
          })}
          validate={[required]}
        />
      </Col>
    </Row>
    <Row>
      <Col md={24}>
        <Field id="note" name="note" label="Notes" component={RenderAutoSizeField} />
      </Col>
    </Row>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
        {props.title}
      </Button>
    </div>
  </FormWrapper>
);

TransferBondForm.propTypes = propTypes;

export default TransferBondForm;
