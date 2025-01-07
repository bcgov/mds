import React from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import { getExplosivesPermitStatusDropdownOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  explosivesPermitStatusDropdownOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  title: PropTypes.string.isRequired,
};

export const ExplosivesPermitStatusForm = (props) => {
  const options = props.explosivesPermitStatusDropdownOptions.filter(({ value }) => {
    return value === "REJ" || value === "WIT";
  });
  return (
    <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
      isModal
      name={FORM.EDIT_EXPLOSIVES_PERMIT_STATUS}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
        onSubmitSuccess: resetForm(FORM.EDIT_EXPLOSIVES_PERMIT_STATUS),
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="application_status"
            name="application_status"
            label="Application Status"
            required
            placeholder="Select an application status"
            component={RenderSelect}
            data={options}
            validate={[required]}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="decision_reason"
            name="decision_reason"
            label="Reason"
            required
            validate={[required]}
            component={RenderAutoSizeField}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
};

ExplosivesPermitStatusForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  explosivesPermitStatusDropdownOptions: getExplosivesPermitStatusDropdownOptions(state),
});

export default compose(
  connect(mapStateToProps)
)(ExplosivesPermitStatusForm);
