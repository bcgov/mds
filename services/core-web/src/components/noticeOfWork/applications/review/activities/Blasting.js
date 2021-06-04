import React from "react";
import { PropTypes } from "prop-types";
import { Field, getFormValues } from "redux-form";
import { Row, Col } from "antd";
import { requiredRadioButton } from "@common/utils/Validate";
import { connect } from "react-redux";

import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
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
        <Col md={12} sm={24}>
          <div className="field-title">
            On-site storage explosives
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
        {!props.blastingFormValues.has_storage_explosive_on_site && (
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
                />
              </>
            </AuthorizationWrapper>
          </Col>
        )}
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Explosive Magazine Storage and Use Permit
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
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Expiry Date
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date").value
              }
              isVisible={
                props.renderOriginalValues("blasting_operation.explosive_permit_expiry_date").edited
              }
            />
          </div>
          <Field
            id="explosive_permit_expiry_date"
            name="explosive_permit_expiry_date"
            component={RenderDate}
            disabled={props.isViewMode}
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
                props.renderOriginalValues("blasting_operation.explosive_permit_number").edited
              }
            />
          </div>
          <Field
            id="explosive_permit_number"
            name="explosive_permit_number"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
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
