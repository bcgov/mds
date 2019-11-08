import React from "react";
import { PropTypes } from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
};

export const SandGravelQuarry = (props) => {
  return (
    <div>
      <br />
      <h4>Soil Conservation</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth Overburden(m)</div>
          <Field
            id="average_overburden_depth"
            name="average_overburden_depth"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Measures to stabilize soil overburden stockpiles and control noxious weeds
          </div>
          <Field
            id="stability_measures_description"
            name="stability_measures_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Average Depth of top soil (m)</div>
          <Field
            id="average_top_soil_depth"
            name="average_top_soil_depth"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>

      <br />
      <h4>Land Use</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Is this site within the Agricultural Land Reserve?</div>
          <Field
            id="is_agricultural_land_reserve"
            name="is_agricultural_land_reserve"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Current land use zoning for the site </div>
          <Field
            id="land_use_zoning"
            name="land_use_zoning"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title--light">Permit Application Number**</div>
          <Field id="" name="" component={RenderField} disabled={props.isViewMode} />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Proposed land use</div>
          <Field
            id="proposed_land_use"
            name="proposed_land_use"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Does the local government have a soil removal bylaw?</div>
          <Field
            id="has_local_soil_removal_bylaw"
            name="has_local_soil_removal_bylaw"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimate total mineable reserves over the life of the mine(m3)
          </div>
          <Field
            id="total_mineable_reserves"
            name="total_mineable_reserves"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">Official community plan for the site</div>
          <Field
            id="community_plan"
            name="community_plan"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">Estimate annual extraction from site (tonnes/year)</div>
          <Field
            id="total_annual_extraction"
            name="total_annual_extraction"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );
};

SandGravelQuarry.propTypes = propTypes;

export default SandGravelQuarry;
