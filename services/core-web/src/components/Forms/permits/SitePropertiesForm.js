import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Row, Col } from "antd";
import { Field, formValueSelector, FormSection, change } from "redux-form";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import { requiredList, maxLength, required } from "@mds/common/redux/utils/Validate";
import {
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getMineTenureTypeDropdownOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { determineExemptionFeeStatus } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
/**
 * @constant SitePropertiesForm renders edit/view for the NoW Application review step
 */

const propTypes = {
  permit: CustomPropTypes.permit.isRequired,
  mineTenureTypes: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  conditionalCommodityOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  conditionalDisturbanceOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  site_properties: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  exemptionFeeStatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  change: PropTypes.func.isRequired,
};

const mapApplicationTypeToTenureType = (permitPrefix) =>
({
  P: ["PLR"],
  C: ["COL"],
  M: ["MIN"],
  G: ["BCL", "PRL"],
  Q: ["BCL", "PRL", "MIN"],
}[permitPrefix]);

export class SitePropertiesForm extends Component {
  formName = FORM.EDIT_SITE_PROPERTIES;

  componentWillReceiveProps = (nextProps) => {
    const permitIsExploration = this.props.permit.permit_no.charAt(1) === "X";
    if (nextProps.site_properties !== this.props.site_properties) {
      const statusCode = determineExemptionFeeStatus(
        this.props.permit.permit_status_code,
        this.props.permit.permit_prefix,
        nextProps.site_properties?.mine_tenure_type_code,
        permitIsExploration,
        nextProps.site_properties?.mine_disturbance_code
      );
      this.props.change(this.formName, "exemption_fee_status_code", statusCode);
    }
    const tenureChanged =
      this.props.site_properties?.mine_tenure_type_code &&
      this.props.site_properties?.mine_tenure_type_code !==
      nextProps.site_properties?.mine_tenure_type_code;

    if (tenureChanged) {
      this.props.change(this.formName, "site_properties.mine_disturbance_code", []);
      this.props.change(this.formName, "site_properties.mine_commodity_code", []);
    }
  };

  render() {
    const isCoalOrMineral =
      this.props.site_properties?.mine_tenure_type_code === "COL" ||
      this.props.site_properties?.mine_tenure_type_code === "MIN";
    return (
      <FormWrapper onSubmit={this.props.onSubmit} initialValues={this.props.initialValues}
        name={FORM.EDIT_SITE_PROPERTIES}
        isModal
        reduxFormConfig={{
          enableReinitialize: true,
        }}
      >
        <FormSection name="site_properties">
          <Row gutter={16}>
            <Col span={24}>
              <Field
                id="mine_tenure_type_code"
                name="mine_tenure_type_code"
                component={RenderSelect}
                label="Tenure"
                required
                validate={[requiredList]}
                data={this.props.mineTenureTypes.filter(({ value }) =>
                  mapApplicationTypeToTenureType(this.props.permit.permit_prefix).includes(value)
                )}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Field
                id="mine_commodity_code"
                name="mine_commodity_code"
                label="Commodity"
                component={RenderMultiSelect}
                data={
                  this.props.site_properties?.mine_tenure_type_code
                    ? this.props.conditionalCommodityOptions[
                    this.props.site_properties?.mine_tenure_type_code
                    ]
                    : null
                }
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Field
                id="mine_disturbance_code"
                name="mine_disturbance_code"
                label="Disturbance"
                required={isCoalOrMineral}
                component={RenderMultiSelect}
                data={
                  this.props.site_properties?.mine_tenure_type_code
                    ? this.props.conditionalDisturbanceOptions[
                    this.props.site_properties?.mine_tenure_type_code
                    ]
                    : null
                }
                validate={isCoalOrMineral ? [required] : []}
              />
            </Col>
          </Row>
        </FormSection>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="exemption_fee_status_code"
              name="exemption_fee_status_code"
              label="Inspection Fee Status"
              placeholder="Inspection Fee Status will be automatically populated."
              component={RenderSelect}
              disabled
              data={this.props.exemptionFeeStatusDropDownOptions}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="exemption_fee_status_note"
              name="exemption_fee_status_note"
              label="Fee Exemption Note"
              component={RenderAutoSizeField}
              validate={[maxLength(300)]}
            />
          </Col>
        </Row>
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Save" />
        </div>
      </FormWrapper>
    );
  }
}

SitePropertiesForm.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_SITE_PROPERTIES);

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );
export default compose(
  connect((state) => ({
    mineTenureTypes: getMineTenureTypeDropdownOptions(state),
    conditionalCommodityOptions: getConditionalCommodityOptions(state),
    conditionalDisturbanceOptions: getConditionalDisturbanceOptionsHash(state),
    site_properties: selector(state, "site_properties"),
    exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
  }), mapDispatchToProps)
)(SitePropertiesForm);
