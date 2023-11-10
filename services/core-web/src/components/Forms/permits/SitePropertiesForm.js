import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Row, Col, Popconfirm, Button } from "antd";
import { Field, formValueSelector, FormSection, reduxForm, Form } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import { requiredList, maxLength, required } from "@common/utils/Validate";
import {
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getMineTenureTypeDropdownOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { determineExemptionFeeStatus } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
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
  submitting: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
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
      this.props.change("exemption_fee_status_code", statusCode);
    }
    const tenureChanged =
      this.props.site_properties?.mine_tenure_type_code &&
      this.props.site_properties?.mine_tenure_type_code !==
        nextProps.site_properties?.mine_tenure_type_code;

    if (tenureChanged) {
      this.props.change("site_properties.mine_disturbance_code", []);
      this.props.change("site_properties.mine_commodity_code", []);
    }
  };

  render() {
    const isCoalOrMineral =
      this.props.site_properties?.mine_tenure_type_code === "COL" ||
      this.props.site_properties?.mine_tenure_type_code === "MIN";
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="site_properties">
          <Row gutter={16}>
            <Col span={24}>
              <div className="field-title">Tenure*</div>
              <Field
                id="mine_tenure_type_code"
                name="mine_tenure_type_code"
                component={RenderSelect}
                validate={[requiredList]}
                data={this.props.mineTenureTypes.filter(({ value }) =>
                  mapApplicationTypeToTenureType(this.props.permit.permit_prefix).includes(value)
                )}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div className="field-title">Commodity</div>
              <Field
                id="mine_commodity_code"
                name="mine_commodity_code"
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
              <div className="field-title">{isCoalOrMineral ? "Disturbance*" : "Disturbance"}</div>
              <Field
                id="mine_disturbance_code"
                name="mine_disturbance_code"
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
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
            onConfirm={() => this.props.closeModal()}
          >
            <Button className="full-mobile" type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
          >
            Save
          </Button>
        </div>
      </Form>
    );
  }
}

SitePropertiesForm.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_SITE_PROPERTIES);

export default compose(
  connect((state) => ({
    mineTenureTypes: getMineTenureTypeDropdownOptions(state),
    conditionalCommodityOptions: getConditionalCommodityOptions(state),
    conditionalDisturbanceOptions: getConditionalDisturbanceOptionsHash(state),
    site_properties: selector(state, "site_properties"),
    exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
  })),
  reduxForm({
    form: FORM.EDIT_SITE_PROPERTIES,
    enableReinitialize: true,
  })
)(SitePropertiesForm);
