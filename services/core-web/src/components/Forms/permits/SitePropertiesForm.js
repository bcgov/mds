/* eslint-disable */
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Row, Col, Popconfirm, Button } from "antd";
import { Field, formValueSelector, FormSection, reduxForm, Form } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import { requiredList, maxLength } from "@common/utils/Validate";
import {
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getMineTenureTypeDropdownOptions,
  getExemptionFeeSatusDropDownOptions,
} from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
/**
 * @constant SitePropertiesForm renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWorkType: PropTypes.string.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  permitPrefix: PropTypes.string.isRequired,
  isExploration: PropTypes.bool.isRequired,
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
  render() {
    const permitPrefix = this.props.permit.permit_no.charAt(0);
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <FormSection name="site_properties">
          <Row gutter={16}>
            <Col span={24}>
              <div className="field-title">Tenure*</div>
              <Field
                id="tenure_type_code"
                name="tenure_type_code"
                component={RenderSelect}
                validate={[requiredList]}
                data={this.props.mineTenureTypes.filter(({ value }) =>
                  mapApplicationTypeToTenureType(permitPrefix).includes(value)
                )}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div className="field-title">Commodity</div>
              <Field
                id="mine_disturbance_code"
                name="mine_disturbance_code"
                component={RenderMultiSelect}
                data={
                  this.props.site_properties?.tenure_type_code
                    ? this.props.conditionalCommodityOptions[
                        this.props.site_properties?.tenure_type_code
                      ]
                    : null
                }
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div className="field-title">Disturbance</div>
              <Field
                id="mine_commodity_code"
                name="mine_commodity_code"
                component={RenderMultiSelect}
                data={
                  this.props.site_properties?.tenure_type_code
                    ? this.props.conditionalDisturbanceOptions[
                        this.props.site_properties?.tenure_type_code
                      ]
                    : null
                }
              />
            </Col>
          </Row>
        </FormSection>
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="exemption_fee_status_code"
              name="exemption_fee_status_code"
              label="Fee Exemption"
              placeholder="Exemption Fee Status will be automatically populated based on Tenure"
              component={RenderSelect}
              disabled
              data={this.props.exemptionFeeSatusDropDownOptions}
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
    exemptionFeeSatusDropDownOptions: getExemptionFeeSatusDropDownOptions(state),
  })),
  reduxForm({
    form: FORM.EDIT_SITE_PROPERTIES,
  })
)(SitePropertiesForm);
