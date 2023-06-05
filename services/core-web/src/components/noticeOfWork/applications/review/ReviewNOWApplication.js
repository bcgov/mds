import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, FormSection, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Row, Col } from "antd";
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
  number,
} from "@common/utils/Validate";
import * as Strings from "@common/constants/strings";
import { USER_ROLES } from "@mds/common";
import { getNoticeOfWorkEditableTypes } from "@common/selectors/noticeOfWorkSelectors";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";
import RenderRadioButtons from "@/components/common/RenderRadioButtons";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderSelect from "@/components/common/RenderSelect";
import RenderDate from "@/components/common/RenderDate";
import * as FORM from "@/constants/forms";
import { OPEN_NEW_TAB } from "@/constants/assets";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import ReviewActivities from "@/components/noticeOfWork/applications/review/ReviewActivities";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications//NOWSubmissionDocuments";
import { NOWOriginalValueTooltip, NOWFieldOriginTooltip } from "@/components/common/CoreTooltip";
import ReviewApplicationFeeContent from "@/components/noticeOfWork/applications/review/ReviewApplicationFeeContent";
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
  isNoticeOfWorkTypeDisabled: PropTypes.bool.isRequired,
  editableApplicationTypeOptions: CustomPropTypes.options.isRequired,
  typeOfApplication: PropTypes.string.isRequired,
  applicationPermitType: PropTypes.string.isRequired,
  surfaceDisturbance: PropTypes.bool.isRequired,
  isOnPrivateLand: PropTypes.bool.isRequired,
  activitiesInPark: PropTypes.bool.isRequired,
  lieutenantGovernorAuthorization: PropTypes.bool.isRequired,
  archaeologySitesAffected: PropTypes.bool.isRequired,
  sharedInfoWithFn: PropTypes.bool.isRequired,
  acknowledgedUNDRIP: PropTypes.bool.isRequired,
  culturalHeritageSites: PropTypes.bool.isRequired,
  appliedLicenceOccupation: PropTypes.bool.isRequired,
  isOnCrownLand: PropTypes.bool.isRequired,
  hasLicenceOfOccupation: PropTypes.bool.isRequired,
  isAccessGated: PropTypes.bool.isRequired,
};

export const ReviewNOWApplication = (props) => {
  const isAdmin = props.userRoles.includes(USER_ROLES[Permission.ADMIN]);

  const renderCodeValues = (codeHash, value) => {
    if (value === Strings.EMPTY_FIELD) {
      return value;
    }
    return codeHash[value];
  };

  const applicationFileTableDescription =
    "In this table, you can see all documents submitted during initial application, revision and new files requested from the proponent. Documents added in this section will not show up in the permit package unless otherwise specified.";

  const applicationFilesTypes = ["AAF", "AEF", "MDO", "SDO"];

  const generateEmliInspectionMapperUrl = (nowApplicationGuid) => {
    const queryString = encodeURIComponent(
      `bcgw_pub_whse_mineral_tenure_8797,NOW_APPLICATION_GUID,${nowApplicationGuid}`
    );
    return `${Strings.EMLI_INSPECTION_MAPPER_BASE_URL}&query=${queryString}`;
  };

  const renderMineInfo = () => (
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
            Directions to the site from the nearest municipality
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
            Proposed Annual Maximum Tonnage
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
          </div>
          <Field
            id="proposed_annual_maximum_tonnage"
            name="proposed_annual_maximum_tonnage"
            component={RenderField}
            validate={[number]}
            disabled
          />
          <div className="field-title">
            Open and view NoW on the Inspection Mapper (new window)&nbsp;&nbsp;
            <a
              href={generateEmliInspectionMapperUrl(props.now_application_guid)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img alt="Open link in new window" src={OPEN_NEW_TAB} style={{ width: "1.25em" }} />
            </a>
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderPermitType = () => (
    <Row gutter={16}>
      <Col md={12} sm={24}>
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
      </Col>
      <Col md={12} sm={24}>
        {props.applicationPermitType === "MY-ABP" && (
          <>
            <div className="field-title">
              Is this the first year of a multi-year, area based application?
              <NOWOriginalValueTooltip
                originalValue={renderCodeValues(
                  props.permitTypeHash,
                  props.renderOriginalValues("is_first_year_of_multi").value
                )}
                isVisible={props.renderOriginalValues("is_first_year_of_multi").edited}
              />
            </div>
            <Field
              id="is_first_year_of_multi"
              name="is_first_year_of_multi"
              component={RenderRadioButtons}
              disabled={props.isViewMode}
            />
          </>
        )}
      </Col>
    </Row>
  );

  const renderAppInfo = () => {
    const noticeOfWorkTypeDropDownDisabled = props.isViewMode || props.isNoticeOfWorkTypeDisabled;

    const filteredApplicationTypeOptions = noticeOfWorkTypeDropDownDisabled
      ? props.applicationTypeOptions
      : props.editableApplicationTypeOptions;
    return (
      <div>
        <Row gutter={16}>
          <Col md={12} sm={24}>
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
              data={filteredApplicationTypeOptions}
              disabled={noticeOfWorkTypeDropDownDisabled}
              validate={[required, validateSelectOptions(props.applicationTypeOptions)]}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Mine Number
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("mine_no").value}
                isVisible={props.renderOriginalValues("mine_no").edited}
              />
            </div>
            <Field id="mine_no" name="mine_no" component={RenderField} disabled />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
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
          </Col>
          <Col md={12} sm={24}>
            {props.typeOfApplication !== "New Permit" && (
              <>
                <div className="field-title">
                  Permit Number
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("proponent_submitted_permit_number").value
                    }
                    isVisible={
                      props.renderOriginalValues("proponent_submitted_permit_number").edited
                    }
                  />
                </div>

                <Field
                  id="proponent_submitted_permit_number"
                  name="proponent_submitted_permit_number"
                  component={RenderField}
                  disabled
                />
              </>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            {props.typeOfApplication !== "New Permit" && (
              <>
                <div className="field-title">
                  Annual Summary submitted for this site?
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    originalValue={props.renderOriginalValues("annual_summary_submitted").value}
                    isVisible={props.renderOriginalValues("annual_summary_submitted").edited}
                  />
                </div>
                <Field
                  id="annual_summary_submitted"
                  name="annual_summary_submitted"
                  component={RenderRadioButtons}
                  disabled={props.isViewMode}
                />
              </>
            )}
          </Col>
        </Row>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <div className="field-title">
              ATS Authorization Number
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("ats_authorization_number").value}
                isVisible={props.renderOriginalValues("ats_authorization_number").edited}
              />
            </div>
            <Field
              id="ats_authorization_number"
              name="ats_authorization_number"
              component={RenderField}
              disabled={props.isViewMode || !isAdmin}
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              Tracking Number
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("now_tracking_number").value}
                isVisible={props.renderOriginalValues("now_tracking_number").edited}
              />
            </div>
            <Field
              id="now_tracking_number"
              name="now_tracking_number"
              component={RenderField}
              disabled
            />
          </Col>
          <Col md={12} sm={24}>
            <div className="field-title">
              ATS Project Number
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("ats_project_number").value}
                isVisible={props.renderOriginalValues("ats_project_number").edited}
              />
            </div>
            <Field
              id="ats_project_number"
              name="ats_project_number"
              component={RenderField}
              disabled={props.isViewMode || !isAdmin}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const renderApplicantInfo = () => (
    <Row gutter={16}>
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
      </Col>
      <Col md={12} sm={24}>
        <ReviewApplicationFeeContent
          initialValues={props.noticeOfWork}
          isViewMode={props.isViewMode}
          isAdmin={isAdmin}
          proposedTonnage={props.proposedTonnage}
          adjustedTonnage={props.adjustedTonnage}
          proposedStartDate={props.proposedStartDate}
          proposedAuthorizationEndDate={props.proposedAuthorizationEndDate}
          isPreLaunch={props.isPreLaunch}
        />
      </Col>
    </Row>
  );

  const renderAccess = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Access presently gated
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              style={{ marginLeft: "5%" }}
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
        {props.isAccessGated && (
          <Col md={12} sm={24}>
            <div className="field-title">
              Key provided to the inspector
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                style={{ marginLeft: "5%" }}
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
        )}
      </Row>
      {/* <h4>Access to Tenure</h4>
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
        {props.surfaceDisturbance && (
          <>
            <Col md={12} sm={24}>
              <div className="field-title">
                Do you have the required access authorizations in place?
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  style={{ marginLeft: "5%" }}
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
            <Col md={12} sm={24}>
              <div className="field-title">
                Provide the type and authorization numbers for each access authorization application
                or exemption to use the road(s).
                {props.isPreLaunch && <NOWFieldOriginTooltip />}
                <NOWOriginalValueTooltip
                  originalValue={
                    props.renderOriginalValues("req_access_authorization_numbers").value
                  }
                  isVisible={props.renderOriginalValues("req_access_authorization_numbers").edited}
                />
              </div>
              <Field
                id="req_access_authorization_numbers"
                name="req_access_authorization_numbers"
                component={RenderAutoSizeField}
                disabled={props.isViewMode}
              />
            </Col>
          </>
        )}
      </Row> */}
    </div>
  );

  const renderAccessToTenure = () => (
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
            isVisible={props.renderOriginalValues("has_surface_disturbance_outside_tenure").edited}
          />
        </div>
        <Field
          id="has_surface_disturbance_outside_tenure"
          name="has_surface_disturbance_outside_tenure"
          component={RenderRadioButtons}
          disabled={props.isViewMode}
        />
      </Col>
      {props.surfaceDisturbance && (
        <>
          <Col md={12} sm={24}>
            <div className="field-title">
              Do you have the required access authorizations in place?
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                style={{ marginLeft: "5%" }}
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
          <Col md={12} sm={24}>
            <div className="field-title">
              Provide the type and authorization numbers for each access authorization application
              or exemption to use the road(s).
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
              <NOWOriginalValueTooltip
                originalValue={props.renderOriginalValues("req_access_authorization_numbers").value}
                isVisible={props.renderOriginalValues("req_access_authorization_numbers").edited}
              />
            </div>
            <Field
              id="req_access_authorization_numbers"
              name="req_access_authorization_numbers"
              component={RenderAutoSizeField}
              disabled={props.isViewMode}
            />
          </Col>
        </>
      )}
    </Row>
  );

  const renderStateOfLand = () => (
    <div>
      <FormSection name="state_of_land">
        <ScrollContentWrapper id="state-of-land" title="Present State of Land">
          <>
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
                      props.renderOriginalValues("state_of_land.type_of_vegetation_description")
                        .value
                    }
                    isVisible={
                      props.renderOriginalValues("state_of_land.type_of_vegetation_description")
                        .edited
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
          </>
        </ScrollContentWrapper>
        <ScrollContentWrapper id="land-ownership" title="Land Ownership">
          <>
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Application in a community watershed
                  <NOWOriginalValueTooltip
                    style={{ marginLeft: "5%" }}
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
            </Row>
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Proposed activities on private land
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    style={{ marginLeft: "5%" }}
                    originalValue={
                      props.renderOriginalValues("state_of_land.is_on_private_land").value
                    }
                    isVisible={
                      props.renderOriginalValues("state_of_land.is_on_private_land").edited
                    }
                  />
                </div>
                <Field
                  id="is_on_private_land"
                  name="is_on_private_land"
                  component={RenderRadioButtons}
                  disabled={props.isViewMode}
                />
              </Col>
            </Row>
            {props.isOnPrivateLand && (
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <div className="field-title">
                    Has notice been served to all parties on private lands?
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      style={{ marginLeft: "5%" }}
                      originalValue={
                        props.renderOriginalValues("state_of_land.notice_served_to_private").value
                      }
                      isVisible={
                        props.renderOriginalValues("state_of_land.notice_served_to_private").edited
                      }
                    />
                  </div>
                  <Field
                    id="notice_served_to_private"
                    name="notice_served_to_private"
                    component={RenderRadioButtons}
                    disabled={props.isViewMode}
                  />
                </Col>
                <Col md={12} sm={24}>
                  <div className="field-title">
                    Legal Description of the land
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      originalValue={
                        props.renderOriginalValues("state_of_land.legal_description_land").value
                      }
                      isVisible={
                        props.renderOriginalValues("state_of_land.legal_description_land").edited
                      }
                    />
                  </div>
                  <Field
                    id="legal_description_land"
                    name="legal_description_land"
                    component={RenderAutoSizeField}
                    disabled={props.isViewMode}
                    validate={[maxLength(4000)]}
                  />
                </Col>
              </Row>
            )}
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Proposed activities on crown land
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    style={{ marginLeft: "5%" }}
                    originalValue={
                      props.renderOriginalValues("state_of_land.is_on_crown_land").value
                    }
                    isVisible={props.renderOriginalValues("state_of_land.is_on_crown_land").edited}
                  />
                </div>
                <Field
                  id="is_on_crown_land"
                  name="is_on_crown_land"
                  component={RenderRadioButtons}
                  disabled={props.isViewMode}
                />
              </Col>
            </Row>
            {props.isOnCrownLand && (
              <>
                <Row gutter={16}>
                  <Col md={12} sm={24}>
                    <div className="field-title">
                      Do you have licence of Occupation?
                      {props.isPreLaunch && <NOWFieldOriginTooltip />}
                      <NOWOriginalValueTooltip
                        style={{ marginLeft: "5%" }}
                        originalValue={
                          props.renderOriginalValues("state_of_land.has_licence_of_occupation")
                            .value
                        }
                        isVisible={
                          props.renderOriginalValues("state_of_land.has_licence_of_occupation")
                            .edited
                        }
                      />
                    </div>
                    <Field
                      id="has_licence_of_occupation"
                      name="has_licence_of_occupation"
                      component={RenderRadioButtons}
                      disabled={props.isViewMode}
                    />
                  </Col>
                </Row>
                {props.hasLicenceOfOccupation && (
                  <Row gutter={16}>
                    <Col md={12} sm={24}>
                      <div className="field-title">
                        Licence of Occupation number(s)
                        {props.isPreLaunch && <NOWFieldOriginTooltip />}
                        <NOWOriginalValueTooltip
                          originalValue={
                            props.renderOriginalValues("state_of_land.licence_of_occupation").value
                          }
                          isVisible={
                            props.renderOriginalValues("state_of_land.licence_of_occupation").edited
                          }
                        />
                      </div>
                      <Field
                        id="licence_of_occupation"
                        name="licence_of_occupation"
                        component={RenderField}
                        disabled={props.isViewMode}
                      />
                    </Col>
                  </Row>
                )}
                {!props.hasLicenceOfOccupation && props.hasLicenceOfOccupation !== undefined && (
                  <>
                    <Row gutter={16}>
                      <Col md={12} sm={24}>
                        <div className="field-title">
                          Have you applied for a Licence of Occupation?
                          {props.isPreLaunch && <NOWFieldOriginTooltip />}
                          <NOWOriginalValueTooltip
                            originalValue={
                              props.renderOriginalValues(
                                "state_of_land.applied_for_licence_of_occupation"
                              ).value
                            }
                            isVisible={
                              props.renderOriginalValues(
                                "state_of_land.applied_for_licence_of_occupation"
                              ).edited
                            }
                          />
                        </div>
                        <Field
                          id="applied_for_licence_of_occupation"
                          name="applied_for_licence_of_occupation"
                          component={RenderRadioButtons}
                          disabled={props.isViewMode}
                        />
                      </Col>
                    </Row>
                    {props.appliedLicenceOccupation && (
                      <Row gutter={16}>
                        <Col md={12} sm={24}>
                          <div className="field-title">
                            File number of Application
                            {props.isPreLaunch && <NOWFieldOriginTooltip />}
                            <NOWOriginalValueTooltip
                              originalValue={
                                props.renderOriginalValues("state_of_land.file_number_of_app").value
                              }
                              isVisible={
                                props.renderOriginalValues("state_of_land.file_number_of_app")
                                  .edited
                              }
                            />
                          </div>
                          <Field
                            id="file_number_of_app"
                            name="file_number_of_app"
                            component={RenderField}
                            disabled={props.isViewMode}
                          />
                        </Col>
                      </Row>
                    )}
                  </>
                )}
              </>
            )}
            <br />
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Are any of the proposed activities in a park under an Act of British Columbia or
                  of Canada or in an area of land established as a Provincial Heritage property
                  under Section 23 of the <i>Heritage Conservation Act</i>?
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("state_of_land.has_activity_in_park").value
                    }
                    isVisible={
                      props.renderOriginalValues("state_of_land.has_activity_in_park").edited
                    }
                  />
                </div>
                <Field
                  id="has_activity_in_park"
                  name="has_activity_in_park"
                  component={RenderRadioButtons}
                  disabled={props.isViewMode}
                />
              </Col>
              {props.activitiesInPark && (
                <Col md={12} sm={24}>
                  <div className="field-title">
                    Do you have authorization by the Lieutenant Governor in Council?
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      style={{ marginLeft: "5%" }}
                      originalValue={
                        props.renderOriginalValues("state_of_land.has_auth_lieutenant_gov_council")
                          .value
                      }
                      isVisible={
                        props.renderOriginalValues("state_of_land.has_auth_lieutenant_gov_council")
                          .edited
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
              )}
            </Row>
            {props.lieutenantGovernorAuthorization && props.activitiesInPark && (
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <div className="field-title">
                    Details of the Authorization
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      originalValue={
                        props.renderOriginalValues("state_of_land.authorization_details").value
                      }
                      isVisible={
                        props.renderOriginalValues("state_of_land.authorization_details").edited
                      }
                    />
                  </div>
                  <Field
                    id="authorization_details"
                    name="authorization_details"
                    component={RenderField}
                    disabled={props.isViewMode}
                  />
                </Col>
              </Row>
            )}
          </>
        </ScrollContentWrapper>

        <ScrollContentWrapper id="cultural-heritage-resources" title="Cultural Heritage Resources">
          <>
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Are you aware of any protected archaeological sites that may be affected by the
                  proposed project?
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("state_of_land.has_archaeology_sites_affected")
                        .value
                    }
                    isVisible={
                      props.renderOriginalValues("state_of_land.has_archaeology_sites_affected")
                        .edited
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
                {props.archaeologySitesAffected && (
                  <>
                    <div className="field-title">
                      Plan to protect the archaeological site
                      {props.isPreLaunch && <NOWFieldOriginTooltip />}
                      <NOWOriginalValueTooltip
                        originalValue={
                          props.renderOriginalValues("state_of_land.arch_site_protection_plan")
                            .value
                        }
                        isVisible={
                          props.renderOriginalValues("state_of_land.arch_site_protection_plan")
                            .edited
                        }
                      />
                    </div>
                    <Field
                      id="arch_site_protection_plan"
                      name="arch_site_protection_plan"
                      component={RenderField}
                      disabled={props.isViewMode}
                    />
                  </>
                )}
              </Col>
            </Row>
          </>
        </ScrollContentWrapper>
        <ScrollContentWrapper id="first-nations-engagement" title="First Nations Engagement">
          <>
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Have you shared information and engaged with First Nations in the area of the
                  proposed activity?
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
                {props.sharedInfoWithFn && (
                  <>
                    <div className="field-title">
                      Describe your First Nations engagement activities
                      {props.isPreLaunch && <NOWFieldOriginTooltip />}
                      <NOWOriginalValueTooltip
                        originalValue={
                          props.renderOriginalValues("state_of_land.fn_engagement_activities").value
                        }
                        isVisible={
                          props.renderOriginalValues("state_of_land.fn_engagement_activities")
                            .edited
                        }
                      />
                    </div>
                    <Field
                      id="fn_engagement_activities"
                      name="fn_engagement_activities"
                      component={RenderAutoSizeField}
                      disabled={props.isViewMode}
                    />
                  </>
                )}
              </Col>
            </Row>
            {props.sharedInfoWithFn && (
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <div className="field-title">
                    As a result of the engagement, are you aware of any cultural heritage resources
                    in the area where the work is proposed?
                    {props.isPreLaunch && <NOWFieldOriginTooltip />}
                    <NOWOriginalValueTooltip
                      originalValue={
                        props.renderOriginalValues(
                          "state_of_land.has_fn_cultural_heritage_sites_in_area"
                        ).value
                      }
                      isVisible={
                        props.renderOriginalValues(
                          "state_of_land.has_fn_cultural_heritage_sites_in_area"
                        ).edited
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
                {props.culturalHeritageSites && (
                  <Col md={12} sm={24}>
                    <div className="field-title">
                      Describe any cultural heritage resources in the area
                      {props.isPreLaunch && <NOWFieldOriginTooltip />}
                      <NOWOriginalValueTooltip
                        originalValue={
                          props.renderOriginalValues("state_of_land.cultural_heritage_description")
                            .value
                        }
                        isVisible={
                          props.renderOriginalValues("state_of_land.cultural_heritage_description")
                            .edited
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
                )}
              </Row>
            )}
          </>
        </ScrollContentWrapper>
        <ScrollContentWrapper id="indegenous-engagement" title="Indigenous Engagement">
          <>
            <Row gutter={16}>
              <Col md={12} sm={24}>
                <div className="field-title">
                  Have you read and understand United Nations Declaration on the Rights of
                  Indigenous Peoples and the Truth and Reconciliation Commission of Canada&apos;s
                  Calls to Action?
                  {props.isPreLaunch && <NOWFieldOriginTooltip />}
                  <NOWOriginalValueTooltip
                    originalValue={
                      props.renderOriginalValues("state_of_land.has_acknowledged_undrip").value
                    }
                    isVisible={
                      props.renderOriginalValues("state_of_land.has_acknowledged_undrip").edited
                    }
                  />
                </div>
                <Field
                  id="has_acknowledged_undrip"
                  name="has_acknowledged_undrip"
                  component={RenderRadioButtons}
                  disabled={props.isViewMode}
                />
              </Col>
            </Row>
          </>
        </ScrollContentWrapper>
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
    <>
      <Row gutter={16}>
        <Col md={24} sm={24}>
          <div className="field-title">
            Sufficient details of your work program to enable a good understanding of the types and
            scope of the activities that will be conducted:
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
    </>
  );

  const renderReclamation = () => (
    <div>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Total merchantable timber volume
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues(
                  "merchantable_timber_volume",
                  "total_merchantable_timber_volume"
                ).value
              }
              isVisible={
                props.renderOriginalValues(
                  "merchantable_timber_volume",
                  "total_merchantable_timber_volume"
                ).edited
              }
            />
          </div>
          <Field
            id="total_merchantable_timber_volume"
            name="total_merchantable_timber_volume"
            component={RenderField}
            disabled
          />
        </Col>
      </Row>
      <br />
      <ReclamationSummary summary={props.reclamationSummary} />
      <br />
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Unreclaimed disturbance from previous year (ha)
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={
                props.renderOriginalValues("unreclaimed_disturbance_previous_year").value
              }
              isVisible={props.renderOriginalValues("unreclaimed_disturbance_previous_year").edited}
            />
          </div>
          <Field
            id="unreclaimed_disturbance_previous_year"
            name="unreclaimed_disturbance_previous_year"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Disturbance planned for reclamation this year (ha)
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("disturbance_planned_reclamation").value}
              isVisible={props.renderOriginalValues("disturbance_planned_reclamation").edited}
            />
          </div>
          <Field
            id="disturbance_planned_reclamation"
            name="disturbance_planned_reclamation"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[number]}
          />
        </Col>
      </Row>
    </div>
  );

  const renderProposedDates = () => (
    <Row gutter={16}>
      <Col md={12} sm={24}>
        {props.typeOfApplication !== "New Permit" && (
          <>
            <div className="field-title">
              Original Start Date
              {props.isPreLaunch && <NOWFieldOriginTooltip />}
            </div>
            <Field
              id="original_start_date"
              name="original_start_date"
              component={RenderDate}
              disabled
            />
          </>
        )}
        <div className="field-title">Proposed Start Date</div>
        <Field
          id="proposed_start_date"
          name="proposed_start_date"
          component={RenderDate}
          disabled
        />
      </Col>
      <Col md={12} sm={24}>
        <div className="field-title">Proposed Authorization End Date</div>
        <Field id="proposed_end_date" name="proposed_end_date" component={RenderDate} disabled />
      </Col>
    </Row>
  );

  const renderOtherInformation = () => (
    <div>
      <Row gutter={16}>
        <Col md={24}>
          <div className="field-title">
            Is there any other information you would like us to know (where possible, do not include
            personal information)
            {props.isPreLaunch && <NOWFieldOriginTooltip />}
            <NOWOriginalValueTooltip
              originalValue={props.renderOriginalValues("other_information").value}
              isVisible={props.renderOriginalValues("other_information").edited}
            />
          </div>
          <Field
            id="other_information"
            name="other_information"
            component={RenderAutoSizeField}
            disabled={props.isViewMode}
          />
        </Col>
      </Row>
    </div>
  );

  return (
    <div>
      <Form layout="vertical">
        <ScrollContentWrapper id="applicant-info" title="Applicant Information">
          {renderApplicantInfo()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="application-info" title="Application Information">
          {renderAppInfo()}
        </ScrollContentWrapper>
        <ScrollContentWrapper
          id="permit-type"
          title="One Year, Multi-Year or Multi-Year Area Based Permit"
        >
          {renderPermitType()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="mine-info" title="Mine Information">
          {renderMineInfo()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="first-aid" title="First Aid">
          {renderFirstAid()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="work-plan" title="Description of Work Program">
          {renderWorkPlan()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="time-proposed-activities" title="Time of Proposed Activities">
          {renderProposedDates()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="access" title="Access">
          {renderAccess()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="access-to-tenure" title="Access to Tenure">
          {renderAccessToTenure()}
        </ScrollContentWrapper>
        {/* <ScrollContentWrapper id="state-of-land" title="State of Land"> */}
        {renderStateOfLand()}
        {/* </ScrollContentWrapper> */}
        <ReviewActivities
          isViewMode={props.isViewMode}
          noticeOfWorkType={props.noticeOfWorkType}
          noticeOfWork={props.initialValues}
          renderOriginalValues={props.renderOriginalValues}
          isPreLaunch={props.isPreLaunch}
        />
        <ScrollContentWrapper id="reclamation" title="Summary of Reclamation">
          {renderReclamation()}
        </ScrollContentWrapper>

        <ScrollContentWrapper id="contacts" title="Contacts">
          <ReviewNOWContacts
            contacts={props.noticeOfWork.contacts}
            isViewMode={props.isViewMode}
            contactFormValues={props.contacts}
            noticeOfWork={props.noticeOfWork}
          />
        </ScrollContentWrapper>
        <ScrollContentWrapper id="other-information" title="Other Information">
          {renderOtherInformation()}
        </ScrollContentWrapper>
        <ScrollContentWrapper id="application-files" title="Application Files">
          <NOWSubmissionDocuments
            now_application_guid={props.now_application_guid}
            documents={props.noticeOfWork.filtered_submission_documents.concat(
              props.noticeOfWork.documents
                ?.filter(
                  ({
                    now_application_document_sub_type_code,
                    now_application_document_type_code,
                    mine_document,
                  }) =>
                    applicationFilesTypes.includes(now_application_document_sub_type_code) &&
                    (now_application_document_type_code !== "PMT" ||
                      now_application_document_type_code !== "PMA" ||
                      mine_document.document_name.includes("DRAFT"))
                )
                .map((doc) => {
                  return {
                    preamble_author: doc.preamble_author,
                    preamble_date: doc.preamble_date,
                    preamble_title: doc.preamble_title,
                    now_application_document_xref_guid: doc.now_application_document_xref_guid,
                    is_referral_package: doc.is_referral_package,
                    is_final_package: doc.is_final_package,
                    is_consultation_package: doc.is_consultation_package,
                    description: doc.description,
                    mine_document_guid: doc.mine_document.mine_document_guid,
                    filename: doc.mine_document.document_name,
                    document_manager_guid: doc.mine_document.document_manager_guid,
                    notForImport: true,
                    ...doc,
                  };
                })
            )}
            importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
            disableCategoryFilter
            displayTableDescription
            tableDescription={applicationFileTableDescription}
            showDescription
            isViewMode={props.isViewMode}
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
    typeOfApplication: selector(state, "type_of_application"),
    applicationPermitType: selector(state, "application_permit_type_code"),
    surfaceDisturbance: selector(state, "has_surface_disturbance_outside_tenure"),
    isOnPrivateLand: selector(state, "state_of_land.is_on_private_land"),
    activitiesInPark: selector(state, "state_of_land.has_activity_in_park"),
    lieutenantGovernorAuthorization: selector(
      state,
      "state_of_land.has_auth_lieutenant_gov_council"
    ),
    archaeologySitesAffected: selector(state, "state_of_land.has_archaeology_sites_affected"),
    sharedInfoWithFn: selector(state, "state_of_land.has_shared_info_with_fn"),
    acknowledgedUNDRIP: selector(state, "state_of_land.has_acknowledged_undrip"),
    culturalHeritageSites: selector(state, "state_of_land.has_fn_cultural_heritage_sites_in_area"),
    isOnCrownLand: selector(state, "state_of_land.is_on_crown_land"),
    hasLicenceOfOccupation: selector(state, "state_of_land.has_licence_of_occupation"),
    appliedLicenceOccupation: selector(state, "state_of_land.applied_for_licence_of_occupation"),
    isAccessGated: selector(state, "is_access_gated"),
    regionDropdownOptions: getMineRegionDropdownOptions(state),
    applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
    applicationProgressStatusCodes: getNoticeOfWorkApplicationProgressStatusCodeOptions(state),
    permitTypeOptions: getDropdownNoticeOfWorkApplicationPermitTypeOptions(state),
    regionHash: getMineRegionHash(state),
    permitTypeHash: getNoticeOfWorkApplicationPermitTypeOptionsHash(state),
    applicationTypeOptionsHash: getNoticeOfWorkApplicationTypeOptionsHash(state),
    userRoles: getUserAccessData(state),
    editableApplicationTypeOptions: getNoticeOfWorkEditableTypes(state),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK,
    touchOnChange: false,
    touchOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {},
  })
)(ReviewNOWApplication);
