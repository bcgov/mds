import React from "react";
import { PropTypes } from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { connect } from "react-redux";
import { Row, Col } from "antd";
import { currencyMask } from "@common/utils/helpers";
import { requiredRadioButton, maxLength, number, required } from "@common/utils/Validate";
import CoreEditableTable from "@/components/common/CoreEditableTable";
import RenderField from "@/components/common/RenderField";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as FORM from "@/constants/forms";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
  isPondDischarged: PropTypes.bool.isRequired,
};

export const SettlingPonds = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Describe the waste water treatment facility (settling pond design, recycling, distance
            from creek, etc.)
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("settling_pond.wastewater_facility_description").value
              }
              isVisible={
                props.renderOriginalValues("settling_pond.wastewater_facility_description").edited
              }
            />
          </div>
          <Field
            id="wastewater_facility_description"
            name="wastewater_facility_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <h4>Activities</h4>
      <CoreEditableTable
        isViewMode={props.isViewMode}
        fieldName="details"
        fieldID="activity_detail_id"
        tableContent={[
          {
            title: "Pond ID",
            value: "activity_type_description",
            component: RenderAutoSizeField,
            minRows: 1,
            validate: [required],
          },
          {
            title: "Width (m)",
            value: "width",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Length (m)",
            value: "length",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Depth (m)",
            value: "depth",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Disturbed Area (ha)",
            value: "disturbed_area",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Merchantable timber volume (m³)",
            value: "timber_volume",
            component: RenderField,
            validate: [number],
          },
          {
            title: "Water Source",
            value: "water_source_description",
            component: RenderAutoSizeField,
          },
          {
            title: "Construction Method",
            value: "construction_plan",
            component: RenderAutoSizeField,
          },
        ]}
      />
      <br />
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Disposal of fines from clean out (i.e. use as a subsoil material)
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("settling_pond.disposal_from_clean_out").value
              }
              isVisible={props.renderOriginalValues("settling_pond.disposal_from_clean_out").edited}
            />
          </div>
          <Field
            id="disposal_from_clean_out"
            name="disposal_from_clean_out"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <div className="field-title">Water from Ponds will be:</div>
      <Row gutter={16}>
        <Col md={24} lg={8}>
          <Field
            label={
              <span>
                Recycled
                <NOWOriginalValueTooltip
                  style={{ marginLeft: "20%" }}
                  originalValue={
                    props.renderOriginalValues("settling_pond.is_ponds_recycled").value
                  }
                  isVisible={props.renderOriginalValues("settling_pond.is_ponds_recycled").edited}
                />
              </span>
            }
            id="is_ponds_recycled"
            name="is_ponds_recycled"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={24} lg={8}>
          <Field
            label={
              <span>
                Exfiltrated to Ground
                <NOWOriginalValueTooltip
                  style={{ marginLeft: "20%" }}
                  originalValue={
                    props.renderOriginalValues("settling_pond.is_ponds_exfiltrated").value
                  }
                  isVisible={
                    props.renderOriginalValues("settling_pond.is_ponds_exfiltrated").edited
                  }
                />
              </span>
            }
            id="is_ponds_exfiltrated"
            name="is_ponds_exfiltrated"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        <Col md={24} lg={8}>
          <Field
            label={
              <span>
                Discharged to Environment
                <NOWOriginalValueTooltip
                  style={{ marginLeft: "20%" }}
                  originalValue={
                    props.renderOriginalValues("settling_pond.is_ponds_discharged").value
                  }
                  isVisible={props.renderOriginalValues("settling_pond.is_ponds_discharged").edited}
                />
              </span>
            }
            id="is_ponds_discharged"
            name="is_ponds_discharged"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
      </Row>
      <br />
      {props.isPondDischarged && (
        <>
          <h4>Discharge to the Environment</h4>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <div className="field-title">
                Describe the type of sediment control structures
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues(
                      "settling_pond.sediment_control_structure_description"
                    ).value
                  }
                  isVisible={
                    props.renderOriginalValues(
                      "settling_pond.sediment_control_structure_description"
                    ).edited
                  }
                />
              </div>
              <Field
                id="sediment_control_structure_description"
                name="sediment_control_structure_description"
                component={RenderAutoSizeField}
                disabled={props.isViewMode}
                validate={[maxLength(4000)]}
              />
            </Col>
            <Col md={12} sm={24}>
              <div className="field-title">
                Describe the type and construction of the decant structure
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("settling_pond.decant_structure_description").value
                  }
                  isVisible={
                    props.renderOriginalValues("settling_pond.decant_structure_description").edited
                  }
                />
              </div>
              <Field
                id="decant_structure_description"
                name="decant_structure_description"
                component={RenderAutoSizeField}
                disabled={props.isViewMode}
                validate={[maxLength(4000)]}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <div className="field-title">
                Describe the area into which the water is discharged
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("settling_pond.water_discharged_description").value
                  }
                  isVisible={
                    props.renderOriginalValues("settling_pond.water_discharged_description").edited
                  }
                />
              </div>
              <Field
                id="water_discharged_description"
                name="water_discharged_description"
                component={RenderAutoSizeField}
                disabled={props.isViewMode}
                validate={[maxLength(4000)]}
              />
            </Col>
            <Col md={12} sm={24}>
              <div className="field-title">
                Describe spillway design
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("settling_pond.spillway_design_description").value
                  }
                  isVisible={
                    props.renderOriginalValues("settling_pond.spillway_design_description").edited
                  }
                />
              </div>
              <Field
                id="spillway_design_description"
                name="spillway_design_description"
                component={RenderAutoSizeField}
                disabled={props.isViewMode}
                validate={[maxLength(4000)]}
              />
            </Col>
          </Row>
        </>
      )}
      <br />
      <h4>Reclamation Program</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed reclamation and timing for this specific activity
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("settling_pond.reclamation_description").value
              }
              isVisible={props.renderOriginalValues("settling_pond.reclamation_description").edited}
            />
          </div>
          <Field
            id="reclamation_description"
            name="reclamation_description"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Estimated Cost of reclamation activities described above
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("settling_pond.reclamation_cost").value}
              isVisible={props.renderOriginalValues("settling_pond.reclamation_cost").edited}
            />
          </div>
          <Field
            id="reclamation_cost"
            name="reclamation_cost"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
            {...currencyMask}
          />
        </Col>
      </Row>
    </div>
  );
};

SettlingPonds.propTypes = propTypes;

const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);
export default connect(
  (state) => ({
    isPondDischarged: selector(state, "settling_pond.is_ponds_discharged"),
  }),
  null
)(SettlingPonds);
