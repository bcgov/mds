import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, FormSection, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Divider, Row, Col } from "antd";
import {
  getNoticeOfWorkApplicationProgressStatusCodeOptions,
  getMineRegionDropdownOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
  getDropdownNoticeOfWorkApplicationPermitTypeOptions,
  getMineRegionHash,
  getNoticeOfWorkApplicationPermitTypeOptionsHash,
  getNoticeOfWorkApplicationTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import {
  required,
  lat,
  lon,
  maxLength,
  requiredRadioButton,
  validateSelectOptions,
} from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderSelect from "@/components/common/RenderSelect";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import ReviewActivities from "@/components/noticeOfWork/applications/review/ReviewActivities";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications//NOWSubmissionDocuments";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import * as Strings from "@common/constants/strings";
import ReviewApplicationFeeContent from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
import { USER_ROLES } from "@common/constants/environment";
import * as Permission from "@/constants/permissions";
import ReviewNOWContacts from "./ReviewNOWContacts";
import ReclamationSummary from "./activities/ReclamationSummary";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  reclamationSummary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.strings)).isRequired,
  now_application_guid: PropTypes.string.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  filtered_submission_documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any).isRequired,
  regionDropdownOptions: CustomPropTypes.options.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
  noticeOfWorkType: PropTypes.string.isRequired,
  renderOriginalValues: PropTypes.func.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  permitTypeHash: PropTypes.objectOf(PropTypes.string).isRequired,
  regionHash: PropTypes.objectOf(PropTypes.string).isRequired,
  applicationTypeOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  permitTypeOptions: CustomPropTypes.options.isRequired,
  initialValues: CustomPropTypes.importedNOWApplication.isRequired,
  proposedTonnage: PropTypes.number.isRequired,
  adjustedTonnage: PropTypes.number.isRequired,
  proposedStartDate: PropTypes.string.isRequired,
  proposedAuthorizationEndDate: PropTypes.string.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  isPreLaunch: PropTypes.bool.isRequired,
};

export const ReviewNOWApplication = (props) => {
  const isAdmin = props.userRoles.includes(USER_ROLES[Permission.ADMIN]);

  const renderCodeValues = (codeHash, value) => {
    if (value === Strings.EMPTY_FIELD) {
      return value;
    }
    return codeHash[value];
  };

  const renderApplicationInfo = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Name of Property
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("property_name").value}
              isVisible={props.renderOriginalValues("property_name").edited}
            />
          </div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[required, maxLength(4000)]}
          />
          <div className="field-title">
            Mine Number
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("mine_no").value}
              isVisible={props.renderOriginalValues("mine_no").edited}
            />
          </div>
          <Field id="mine_no" name="mine_no" component={RenderField} disabled />
          <div className="field-title">
            Region
            <NOWOriginalValueTooltip
              originalValue={renderCodeValues(
                props.regionHash,
                props.renderOriginalValues("mine_region").value
              )}
              isVisible={props.renderOriginalValues("mine_region").edited}
            />
          </div>
          <Field
            id="mine_region"
            name="mine_region"
            component={RenderSelect}
            data={props.regionDropdownOptions}
            validate={[validateSelectOptions(props.regionDropdownOptions)]}
            disabled
          />
          <div className="field-title">
            Lat
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("latitude").value}
              isVisible={props.renderOriginalValues("latitude").edited}
            />
          </div>
          <Field id="latitude" name="latitude" component={RenderField} disabled validate={[lat]} />
          <div className="field-title">
            Long
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("longitude").value}
              isVisible={props.renderOriginalValues("longitude").edited}
            />
          </div>
          <Field
            id="longitude"
            name="longitude"
            component={RenderField}
            disabled
            validate={[lon]}
          />
          <div className="field-title">
            Type of Notice of Work
            <NOWOriginalValueTooltip
              originalValue={renderCodeValues(
                props.applicationTypeOptionsHash,
                props.renderOriginalValues("notice_of_work_type_code").value
              )}
              isVisible={props.renderOriginalValues("notice_of_work_type_code").edited}
            />
          </div>
          <Field
            id="notice_of_work_type_code"
            name="notice_of_work_type_code"
            component={RenderSelect}
            data={props.applicationTypeOptions}
            disabled
            validate={[required, validateSelectOptions(props.applicationTypeOptions)]}
          />
          <div className="field-title">
            Permit Type
            <NOWOriginalValueTooltip
              originalValue={renderCodeValues(
                props.permitTypeHash,
                props.renderOriginalValues("application_permit_type_code").value
              )}
              isVisible={props.renderOriginalValues("application_permit_type_code").edited}
            />
          </div>
          <Field
            id="application_permit_type_code"
            name="application_permit_type_code"
            component={RenderSelect}
            data={props.permitTypeOptions}
            disabled={props.isViewMode}
            validate={[validateSelectOptions(props.permitTypeOptions)]}
          />
          <div className="field-title">
            Type of Application
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("type_of_application").value}
              isVisible={props.renderOriginalValues("type_of_application").edited}
            />
          </div>
          <Field
            id="type_of_application"
            name="type_of_application"
            component={RenderField}
            disabled
          />
          <div className="field-title">
            Crown Grant / District Lot Number
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("crown_grant_or_district_lot_numbers").value
              }
              isVisible={props.renderOriginalValues("crown_grant_or_district_lot_numbers").edited}
            />
          </div>
          <Field
            id="crown_grant_or_district_lot_numbers"
            name="crown_grant_or_district_lot_numbers"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
          <div className="field-title">
            Tenure Number(s)
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("tenure_number").value}
              isVisible={props.renderOriginalValues("tenure_number").edited}
            />
          </div>
          <Field
            id="tenure_number"
            name="tenure_number"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Individual or Company/Organization?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("is_applicant_individual_or_company").value}
              isVisible={props.renderOriginalValues("is_applicant_individual_or_company").edited}
            />
          </div>
          <Field
            id="is_applicant_individual_or_company"
            name="is_applicant_individual_or_company"
            component={RenderField}
            disabled={props.isViewMode}
          />
          <div className="field-title">
            Relationship to Individual or Company/Organization?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("relationship_to_applicant").value}
              isVisible={props.renderOriginalValues("relationship_to_applicant").edited}
            />
          </div>
          <Field
            id="relationship_to_applicant"
            name="relationship_to_applicant"
            component={RenderField}
            disabled={props.isViewMode}
          />
          <div className="field-title">
            Description of Land
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("description_of_land").value}
              isVisible={props.renderOriginalValues("description_of_land").edited}
            />
          </div>
          <Field
            id="description_of_land"
            name="description_of_land"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
          <ReviewApplicationFeeContent
            initialValues={props.noticeOfWork}
            isViewMode={props.isViewMode}
            isAdmin={isAdmin}
            proposedTonnage={props.proposedTonnage}
            adjustedTonnage={props.adjustedTonnage}
            proposedStartDate={props.proposedStartDate}
            proposedAuthorizationEndDate={props.proposedAuthorizationEndDate}
          />
        </Col>
      </Row>
    </div>
  );

  const renderAccess = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Directions to Site
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("directions_to_site").value}
              isVisible={props.renderOriginalValues("directions_to_site").edited}
            />
          </div>
          <Field
            id="directions_to_site"
            name="directions_to_site"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
            validate={[maxLength(4000)]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you have the required access authorizations in place?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("has_req_access_authorizations").value}
              isVisible={props.renderOriginalValues("has_req_access_authorizations").edited}
            />
          </div>
          <Field
            id="has_req_access_authorizations"
            name="has_req_access_authorizations"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Do you need to build a road, create stream crossings or other surface disturbance that
            will not be on your tenure?
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("has_surface_disturbance_outside_tenure").value
              }
              isVisible={
                props.renderOriginalValues("has_surface_disturbance_outside_tenure").edited
              }
            />
          </div>
          <Field
            id="has_surface_disturbance_outside_tenure"
            name="has_surface_disturbance_outside_tenure"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title--light">
            Provide the type and authorization numbers for each access authorization application or
            exemption to use the road(s).
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("req_access_authorization_numbers").value}
              isVisible={props.renderOriginalValues("req_access_authorization_numbers").edited}
            />
          </div>
          <Field
            id="req_access_authorization_numbers"
            name="req_access_authorization_numbers"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Access presently gated
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("is_access_gated").value}
              isVisible={props.renderOriginalValues("is_access_gated").edited}
            />
          </div>
          <Field
            id="is_access_gated"
            name="is_access_gated"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Key provided to the inspector
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("has_key_for_inspector").value}
              isVisible={props.renderOriginalValues("has_key_for_inspector").edited}
            />
          </div>
          <Field
            id="has_key_for_inspector"
            name="has_key_for_inspector"
            component={RenderRadioButtons}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderStateOfLand = () => (
    <div>
      <h4>Present State of Land</h4>
      <FormSection name="state_of_land">
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Present condition of the land
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.present_land_condition_description")
                    .value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.present_land_condition_description")
                    .edited
                }
              />
            </div>
            <Field
              id="present_land_condition_description"
              name="present_land_condition_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Current means of access
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.means_of_access_description").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.means_of_access_description").edited
                }
              />
            </div>
            <Field
              id="means_of_access_description"
              name="means_of_access_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Physiography
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.physiography_description").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.physiography_description").edited
                }
              />
            </div>
            <Field
              id="physiography_description"
              name="physiography_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Old Equipment
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.old_equipment_description").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.old_equipment_description").edited
                }
              />
            </div>
            <Field
              id="old_equipment_description"
              name="old_equipment_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Type of vegetation
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.type_of_vegetation_description").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.type_of_vegetation_description").edited
                }
              />
            </div>
            <Field
              id="type_of_vegetation_description"
              name="type_of_vegetation_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Recreational trail/use
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.recreational_trail_use_description")
                    .value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.recreational_trail_use_description")
                    .edited
                }
              />
            </div>
            <Field
              id="recreational_trail_use_description"
              name="recreational_trail_use_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>

        <br />
        <h4>Land Ownership</h4>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Application in a community watershed
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_community_water_shed").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.has_community_water_shed").edited
                }
              />
            </div>
            <Field
              id="has_community_water_shed"
              name="has_community_water_shed"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Activities in park
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_activity_in_park").value
                }
                isVisible={props.renderOriginalValues("state_of_land.has_activity_in_park").edited}
              />
            </div>
            <Field
              id="has_activity_in_park"
              name="has_activity_in_park"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Proposed activities on private land
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("state_of_land.is_on_private_land").value}
                isVisible={props.renderOriginalValues("state_of_land.is_on_private_land").edited}
              />
            </div>
            <Field
              id="is_on_private_land"
              name="is_on_private_land"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Do you have authorization by the Lieutenant Governor in Council?
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_auth_lieutenant_gov_council").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.has_auth_lieutenant_gov_council").edited
                }
              />
            </div>
            <Field
              id="has_auth_lieutenant_gov_council"
              name="has_auth_lieutenant_gov_council"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>

        <br />
        <h4>Cultural Heritage Resources</h4>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Are you aware of any protected archaeological sites that may be affected by the
              proposed project?
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_archaeology_sites_affected").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.has_archaeology_sites_affected").edited
                }
              />
            </div>
            <Field
              id="has_archaeology_sites_affected"
              name="has_archaeology_sites_affected"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
              validate={[requiredRadioButton]}
            />
            <div className="field-title">
              Plan to protect the archaeological site
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.arch_site_protection_plan").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.arch_site_protection_plan").edited
                }
              />
            </div>
            <Field
              id="arch_site_protection_plan"
              name="arch_site_protection_plan"
              component={RenderField}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>

        <br />
        <h4>First Nations Engagement</h4>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Have you shared information and engaged with First Nations in the area of the proposed
              activity?
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_shared_info_with_fn").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.has_shared_info_with_fn").edited
                }
              />
            </div>
            <Field
              id="has_shared_info_with_fn"
              name="has_shared_info_with_fn"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              As a result of the engagement, are you aware of any cultural heritage resources in the
              area where the work is proposed?
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.has_fn_cultural_heritage_sites_in_area")
                    .value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.has_fn_cultural_heritage_sites_in_area")
                    .edited
                }
              />
            </div>
            <Field
              id="has_fn_cultural_heritage_sites_in_area"
              name="has_fn_cultural_heritage_sites_in_area"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              Describe your First Nations engagement activities
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.fn_engagement_activities").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.fn_engagement_activities").edited
                }
              />
            </div>
            <Field
              id="fn_engagement_activities"
              name="fn_engagement_activities"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Describe any cultural heritage resources in the area
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={
                  props.renderOriginalValues("state_of_land.cultural_heritage_description").value
                }
                isVisible={
                  props.renderOriginalValues("state_of_land.cultural_heritage_description").edited
                }
              />
            </div>
            <Field
              id="cultural_heritage_description"
              name="cultural_heritage_description"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
      </FormSection>
    </div>
  );

  const renderFirstAid = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Proposed First Aid equipment on-site
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("first_aid_equipment_on_site").value}
              isVisible={props.renderOriginalValues("first_aid_equipment_on_site").edited}
            />
          </div>
          <Field
            id="first_aid_equipment_on_site"
            name="first_aid_equipment_on_site"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Level of First Aid Certificate held by attendant
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("first_aid_cert_level").value}
              isVisible={props.renderOriginalValues("first_aid_cert_level").edited}
            />
          </div>
          <Field
            id="first_aid_cert_level"
            name="first_aid_cert_level"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  const renderWorkPlan = () => (
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <div className="field-title">
          Description of Work
          {props.isPreLaunch && <NOWFieldOriginTooltip />}
          <NOWOriginalValueTooltip
            originalValue={props.renderOriginalValues("work_plan").value}
            isVisible={props.renderOriginalValues("work_plan").edited}
          />
        </div>
        <Field
          id="work_plan"
          name="work_plan"
          component={RenderAutoSizeField}
          disabled={props.isViewMode}
        />
      </Col>
    </Row>
  );

  const renderReclamation = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total merchantable timber volume
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("merchantable_timber_volume").value}
              isVisible={props.renderOriginalValues("merchantable_timber_volume").edited}
            />
          </div>
          <Field
            id="merchantable_timber_volume"
            name="merchantable_timber_volume"
            component={RenderField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
      <br />
      <ReclamationSummary summary={props.reclamationSummary} />
    </div>
  );

  return (
    <div>
      <Form layout="vertical">
        <ScrollContentWrapper id="application-info" title="Application Info">
          {renderApplicationInfo()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="contacts" title="Contacts">
          <ReviewNOWContacts
            contacts={props.noticeOfWork.contacts}
            isViewMode={props.isViewMode}
            contactFormValues={props.contacts}
            noticeOfWork={props.noticeOfWork}
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper id="access" title="Access">
          {renderAccess()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="state-of-land" title="State of Land">
          {renderStateOfLand()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="first-aid" title="First Aid">
          {renderFirstAid()}
        </ScrollContentWrapper>
        <br />
        <h2>Work Plan</h2>
        <Divider />
        {renderWorkPlan()}
        <br />
        <ScrollContentWrapper id="reclamation" title="Summary of Reclamation">
          {renderReclamation()}
        </ScrollContentWrapper>
        <ReviewActivities
          isViewMode={props.isViewMode}
          noticeOfWorkType={props.noticeOfWorkType}
          noticeOfWork={props.initialValues}
          renderOriginalValues={props.renderOriginalValues}
          isPreLaunch={props.isPreLaunch}
        />
        <ScrollContentWrapper id="application-files" title="vFCBC/NROS Application Files">
          <NOWSubmissionDocuments
            now_application_guid={props.now_application_guid}
            documents={props.filtered_submission_documents}
            importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
            displayTableDescription
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper
          id="additional-application-files"
          title="Additional Application Files"
        >
          <NOWDocuments
            documents={props.documents}
            isViewMode={!props.isViewMode}
            disclaimerText="Attach any file revisions or new files requested from the proponent here."
          />
        </ScrollContentWrapper>
      </Form>
    </div>
  );
};

ReviewNOWApplication.propTypes = propTypes;
const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);

export default compose(
  connect((state) => ({
    contacts: selector(state, "contacts"),
    now_application_guid: selector(state, "now_application_guid"),
    documents: selector(state, "documents"),
    submission_documents: selector(state, "submission_documents"),
    imported_submission_documents: selector(state, "imported_submission_documents"),
    filtered_submission_documents: selector(state, "filtered_submission_documents"),
    proposedTonnage: selector(state, "proposed_annual_maximum_tonnage"),
    adjustedTonnage: selector(state, "adjusted_annual_maximum_tonnage"),
    proposedStartDate: selector(state, "proposed_start_date"),
    proposedAuthorizationEndDate: selector(state, "proposed_end_date"),
    regionDropdownOptions: getMineRegionDropdownOptions(state),
    applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
    applicationProgressStatusCodes: getNoticeOfWorkApplicationProgressStatusCodeOptions(state),
    permitTypeOptions: getDropdownNoticeOfWorkApplicationPermitTypeOptions(state),
    regionHash: getMineRegionHash(state),
    permitTypeHash: getNoticeOfWorkApplicationPermitTypeOptionsHash(state),
    applicationTypeOptionsHash: getNoticeOfWorkApplicationTypeOptionsHash(state),
    userRoles: getUserAccessData(state),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK,
    touchOnChange: false,
    touchOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {},
  })
)(ReviewNOWApplication);
