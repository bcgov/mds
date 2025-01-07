import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  permits: PropTypes.arrayOf(CustomPropTypes.permit).isRequired,
};

export const TransferBondForm = (props) => (
  <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
    name={FORM.TRANSFER_BOND}
    isModal
    reduxFormConfig={{
      touchOnBlur: false,
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
      <RenderCancelButton />
      <RenderSubmitButton buttonText={props.title} />
    </div>
  </FormWrapper>
);

TransferBondForm.propTypes = propTypes;

export default TransferBondForm;
