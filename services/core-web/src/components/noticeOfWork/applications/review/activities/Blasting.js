import React from "react";
import { PropTypes } from "prop-types";
import { Field, getFormValues } from "redux-form";
import { Row, Col } from "antd";
import { requiredRadioButton, required } from "@common/utils/Validate";
import { connect } from "react-redux";

import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderCheckbox from "@/components/common/RenderCheckbox";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import AuthorizationWrapper from "@/components/common/wrappers/AuthorizationWrapper";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
  blastingFormValues: PropTypes.objectOf(CustomPropTypes.blasting).isRequired,
};

export const Blasting = (props) => {
  return (
    <div>
      <Row gutter={16}>
        <div className="field-title">
          Activities where blasting will occur
          {props.isPreLaunch && <NOWFieldOriginTooltip />}
        </div>
        <Col sm={24}>
          <Field
            id="show_access_roads"
            name="show_access_roads"
            label={
              <>
                Access roads, trails, heli pads, air strips and boat ramps
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_access_roads").value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.show_access_roads").edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_camps"
            name="show_camps"
            label={
              <>
                Camps, Bldgs, Staging Areas and/or Fuel / Lubricants Storage
                <NOWOriginalValueTooltip
                  originalValue={props.renderOriginalValues("blasting_operation.show_camps").value}
                  isVisible={props.renderOriginalValues("blasting_operation.show_camps").edited}
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_surface_drilling"
            name="show_surface_drilling"
            label={
              <>
                Exploration Surface Drilling
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_surface_drilling").value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.show_surface_drilling").edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_mech_trench"
            name="show_mech_trench"
            label={
              <>
                Mechanical Trenching / Test Pits
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_mech_trench").value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.show_mech_trench").edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_seismic"
            name="show_seismic"
            label={
              <>
                Seismic
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_seismic").value
                  }
                  isVisible={props.renderOriginalValues("blasting_operation.show_seismic").edited}
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_bulk"
            name="show_bulk"
            label={
              <>
                Surface Bulk Sample
                <NOWOriginalValueTooltip
                  originalValue={props.renderOriginalValues("blasting_operation.show_bulk").value}
                  isVisible={props.renderOriginalValues("blasting_operation.show_bulk").edited}
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_underground_exploration"
            name="show_underground_exploration"
            label={
              <>
                Underground Exploration including Underground Bulk Sampling
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_underground_exploration")
                      .value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.show_underground_exploration")
                      .edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
        <Col sm={24}>
          <Field
            id="show_sand_gravel_quarry"
            name="show_sand_gravel_quarry"
            label={
              <>
                Sand & Gravel / Quarry Operations
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.show_sand_gravel_quarry").value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.show_sand_gravel_quarry").edited
                  }
                  style={{ marginLeft: "5px" }}
                />
              </>
            }
            type="checkbox"
            disabled={props.isViewMode}
            component={RenderCheckbox}
          />
        </Col>
      </Row>
      <br />
      <h4>On Site Storage of Explosives</h4>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposing to store explosives on site?
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.has_storage_explosive_on_site").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.has_storage_explosive_on_site")
                  .edited
              }
            />
          </div>
          <Field
            id="has_storage_explosive_on_site"
            name="has_storage_explosive_on_site"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
            validate={[requiredRadioButton]}
          />
        </Col>
        {!props.blastingFormValues.has_storage_explosive_on_site &&
          props.blastingFormValues.has_storage_explosive_on_site !== undefined && (
            <Col md={12} sm={24}>
              <AuthorizationWrapper inTesting>
                <>
                  <div className="field-title">
                    Describe how the explosives will get to the site
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      originalValue={
                        props.renderOriginalValues("blasting_operation.describe_explosives_to_site")
                          .value
                      }
                      isVisible={
                        props.renderOriginalValues("blasting_operation.describe_explosives_to_site")
                          .edited
                      }
                    />
                  </div>
                  <Field
                    id="describe_explosives_to_site"
                    name="describe_explosives_to_site"
                    component={RenderAutoSizeField}
                    disabled={props.isViewMode}
                    validate={
                      !props.blastingFormValues.has_storage_explosive_on_site ? [required] : []
                    }
                  />
                </>
              </AuthorizationWrapper>
            </Col>
          )}
      </Row>
      {props.blastingFormValues.has_storage_explosive_on_site && (
        <>
          <h4>Explosives Magazine Storage and Use Permit</h4>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <div className="field-title">
                Has BC Explosive Magazine Storage and Use Permit been issued?
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("blasting_operation.explosive_permit_issued").value
                  }
                  isVisible={
                    props.renderOriginalValues("blasting_operation.explosive_permit_issued").edited
                  }
                />
              </div>
              <Field
                id="explosive_permit_issued"
                name="explosive_permit_issued"
                component={RenderRadioButtons}
                disabled={props.isViewMode}
                validate={[requiredRadioButton]}
              />
            </Col>
          </Row>
          {props.blastingFormValues.explosive_permit_issued && (
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Expiry Date
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date")
                        .value
                    }
                    isVisible={
                      props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date")
                        .edited
                    }
                  />
                </div>
                <Field
                  id="explosive_permit_expiry_date"
                  name="explosive_permit_expiry_date"
                  component={RenderDate}
                  disabled={props.isViewMode}
                  validate={props.blastingFormValues.explosive_permit_issued ? [required] : []}
                />
              </Col>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Permit Number
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("blasting_operation.explosive_permit_number").value
                    }
                    isVisible={
                      props.renderOriginalValues("blasting_operation.explosive_permit_number")
                        .edited
                    }
                  />
                </div>
                <Field
                  id="explosive_permit_number"
                  name="explosive_permit_number"
                  component={RenderField}
                  disabled={props.isViewMode}
                  validate={props.blastingFormValues.explosive_permit_issued ? [required] : []}
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
};

Blasting.propTypes = propTypes;

export default connect(
  (state) => ({
    blastingFormValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state).blasting_operation || {},
  }),
  null
)(Blasting);
