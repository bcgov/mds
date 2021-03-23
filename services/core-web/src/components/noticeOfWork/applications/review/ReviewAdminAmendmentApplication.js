/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, formValueSelector } from "redux-form";
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
  getAmendmentReasonCodeDropdownOptions,
  getAmendmentSourceTypeCodeDropdownOptions,
} from "@common/selectors/staticContentSelectors";
import { getUserAccessData } from "@common/selectors/authenticationSelectors";
import {
  required,
  lat,
  lon,
  maxLength,
  validateSelectOptions,
  requiredList,
} from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import { AdminAmendmentNoDataTooltip, CoreTooltip } from "@/components/common/CoreTooltip";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import * as Strings from "@common/constants/strings";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import RenderDate from "@/components/common/RenderDate";
import ReviewNOWContacts from "./ReviewNOWContacts";

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
  amendmentReasonCodeOptions: CustomPropTypes.options.isRequired,
  amendmentSourceTypeCodeOptions: CustomPropTypes.options.isRequired,
};

export const ReviewAdminAmendmentApplication = (props) => {
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
          <div className="field-title">Source of Amendment</div>
          <Field
            id="amendment_source_type_code"
            name="amendment_source_type_code"
            component={RenderSelect}
            disabled={props.isViewMode}
            validate={[required]}
            data={props.amendmentSourceTypeCodeOptions}
          />
          <div className="field-title">Reason for Amendment</div>
          <Field
            id="amendment_reason_codes"
            name="amendment_reason_codes"
            component={RenderMultiSelect}
            disabled={props.isViewMode}
            validate={[requiredList]}
            data={props.amendmentReasonCodeOptions}
          />
          <div className="field-title">
            Name of Property
            {!props.noticeOfWork.has_source_conditions && <AdminAmendmentNoDataTooltip />}
          </div>
          <Field
            id="property_name"
            name="property_name"
            component={RenderField}
            disabled={props.isViewMode}
            validate={[required, maxLength(4000)]}
          />
          <div className="field-title">Mine Number</div>
          <Field id="mine_no" name="mine_no" component={RenderField} disabled />
          <div className="field-title">Region</div>
          <Field
            id="mine_region"
            name="mine_region"
            component={RenderSelect}
            data={props.regionDropdownOptions}
            validate={[validateSelectOptions(props.regionDropdownOptions)]}
            disabled
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Lat
            {!props.noticeOfWork.has_source_conditions && <AdminAmendmentNoDataTooltip />}
          </div>
          <Field id="latitude" name="latitude" component={RenderField} disabled validate={[lat]} />
          <div className="field-title">
            Long
            {!props.noticeOfWork.has_source_conditions && <AdminAmendmentNoDataTooltip />}
          </div>
          <Field
            id="longitude"
            name="longitude"
            component={RenderField}
            disabled
            validate={[lon]}
          />
          <div className="field-title">Type of Administrative Amendment</div>
          <Field
            id="notice_of_work_type_code"
            name="notice_of_work_type_code"
            component={RenderSelect}
            data={props.applicationTypeOptions}
            disabled
            validate={[required, validateSelectOptions(props.applicationTypeOptions)]}
          />
          <div className="field-title">Type of Application</div>
          <Field
            id="type_of_application"
            name="type_of_application"
            component={RenderField}
            disabled
          />
          <div className="field-title">
            Proposed Start Date
            <CoreTooltip title="This value was populated using the source amendment issue date, This value can be changed with the issuing the amendment" />
          </div>
          <Field
            id="proposed_start_date"
            name="proposed_start_date"
            component={RenderDate}
            disabled
          />
          <div className="field-title">
            Proposed End Date
            <CoreTooltip title="This value was populated using the source amendment authorization end date, This value can be changed with the issuing the amendment" />
          </div>
          <Field id="proposed_end_date" name="proposed_end_date" component={RenderDate} disabled />
        </Col>
      </Row>
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

ReviewAdminAmendmentApplication.propTypes = propTypes;
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
    amendmentReasonCodeOptions: getAmendmentReasonCodeDropdownOptions(state),
    amendmentSourceTypeCodeOptions: getAmendmentSourceTypeCodeDropdownOptions(state),
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK,
    touchOnChange: false,
    touchOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {},
  })
)(ReviewAdminAmendmentApplication);
