/* eslint-disable */
import React, { Component } from "react";
import { PropTypes } from "prop-types";
import { Row, Col } from "antd";
import { Field, formValueSelector, FormSection } from "redux-form";
import { connect } from "react-redux";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import { requiredList } from "@common/utils/Validate";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import {
  getConditionalDisturbanceOptionsHash,
  getConditionalCommodityOptions,
  getDisturbanceOptionHash,
  getCommodityOptionHash,
  getMineStatusDropDownOptions,
  getMineRegionDropdownOptions,
  getMineTenureTypeDropdownOptions,
  getMineTenureTypesHash,
} from "@common/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
/**
 * @constant ReviewSiteProperties renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWorkType: PropTypes.string.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

const mapApplicationTypeToTenureType = (code) =>
  ({
    PLA: ["PLR"],
    COL: ["COL"],
    MIN: ["MIN"],
    SAG: ["BCL", "PRL"],
    QCA: ["BCL", "PRL"],
    QIM: ["MIN"],
  }[code]);
export class ReviewSiteProperties extends Component {
  render() {
    return (
      <FormSection name="site_properties">
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Tenure*
              <CoreTooltip title="The Tenure is based on the Application Type" />
            </div>
            <Field
              id="tenure_type_code"
              name="tenure_type_code"
              component={RenderSelect}
              disabled={this.props.isViewMode}
              validate={[requiredList]}
              data={this.props.mineTenureTypes.filter(({ value }) =>
                mapApplicationTypeToTenureType(this.props.noticeOfWorkType).includes(value)
              )}
            />
            <div className="field-title">Disturbance</div>
            <Field
              id="mine_commodity_code"
              name="mine_commodity_code"
              component={RenderMultiSelect}
              disabled={this.props.isViewMode}
              data={
                this.props.site_properties?.tenure_type_code
                  ? this.props.conditionalDisturbanceOptions[
                      this.props.site_properties?.tenure_type_code
                    ]
                  : null
              }
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">Commodity</div>
            <Field
              id="mine_disturbance_code"
              name="mine_disturbance_code"
              component={RenderMultiSelect}
              disabled={this.props.isViewMode}
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
      </FormSection>
    );
  }
}

ReviewSiteProperties.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);

const mapStateToProps = (state) => ({
  mineStatusDropDownOptions: getMineStatusDropDownOptions(state),
  mineRegionOptions: getMineRegionDropdownOptions(state),
  mineTenureHash: getMineTenureTypesHash(state),
  mineCommodityOptionsHash: getCommodityOptionHash(state),
  mineDisturbanceOptionsHash: getDisturbanceOptionHash(state),
  mineTenureTypes: getMineTenureTypeDropdownOptions(state),
  conditionalCommodityOptions: getConditionalCommodityOptions(state),
  conditionalDisturbanceOptions: getConditionalDisturbanceOptionsHash(state),
  site_properties: selector(state, "site_properties"),
});

export default connect(mapStateToProps)(ReviewSiteProperties);
