import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, formValueSelector } from "redux-form";
import { Row, Col } from "antd";
import {
  getNoticeOfWorkApplicationProgressStatusCodeOptions,
  getMineRegionDropdownOptions,
  getDropdownNoticeOfWorkApplicationTypeOptions,
  getNoticeOfWorkApplicationPermitTypeOptionsHash,
  getApplicationReasonCodeDropdownOptions,
  getApplicationSourceTypeCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import {
  required,
  lat,
  lon,
  maxLength,
  requiredList,
} from "@mds/common/redux/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import RenderMultiSelect from "@mds/common/components/forms/RenderMultiSelect";
import RenderDate from "@mds/common/components/forms/RenderDate";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { isEmpty } from "lodash";
import * as Strings from "@mds/common/constants/strings";
import ReviewNOWContacts from "./ReviewNOWContacts";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  isViewMode: PropTypes.bool.isRequired,
  contacts: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  regionDropdownOptions: CustomPropTypes.options.isRequired,
  applicationTypeOptions: CustomPropTypes.options.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  applicationReasonCodeOptions: CustomPropTypes.options.isRequired,
  applicationSourceTypeCodeOptions: CustomPropTypes.options.isRequired,
  permits: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  isNoticeOfWorkTypeDisabled: PropTypes.bool,
  initialValues: PropTypes.any,
};

const defaultProps = {
  isNoticeOfWorkTypeDisabled: true,
};

const mapNoticeOfWorkTypeBasedOnPermitNumber = (permitPrefix) =>
  isEmpty(permitPrefix) ? undefined : Strings.APPLICATION_TYPES_BY_PERMIT_PREFIX[permitPrefix];

export const ReviewAdminAmendmentApplication = (props) => {
  const renderApplicationInfo = () => {
    const noticeOfWorkTypeDropDownDisabled = props.isViewMode || props.isNoticeOfWorkTypeDisabled;
    const permit = props.permits.find(
      (p) => p.permit_guid === props.noticeOfWork.source_permit_guid
    );

    const filteredApplicationTypeOptions = noticeOfWorkTypeDropDownDisabled
      ? props.applicationTypeOptions
      : props.applicationTypeOptions.filter((o) =>
        mapNoticeOfWorkTypeBasedOnPermitNumber(permit.permit_prefix)?.includes(o.value)
      );

    return (
      <div>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Field
              id="application_source_type_code"
              name="application_source_type_code"
              component={RenderSelect}
              disabled={props.isViewMode}
              label="Source of Amendment"
              required
              validate={[required]}
              data={props.applicationSourceTypeCodeOptions}
            />
            <Field
              id="application_reason_codes"
              name="application_reason_codes"
              component={RenderMultiSelect}
              disabled={props.isViewMode}
              label="Reason for Amendment"
              required
              validate={[requiredList]}
              data={props.applicationReasonCodeOptions}
            />
            <Field
              id="property_name"
              name="property_name"
              component={RenderField}
              disabled={props.isViewMode}
              label="Name of Property"
              required
              validate={[required, maxLength(4000)]}
            />
            <Field label="Mine Number" id="mine_no" name="mine_no" component={RenderField} disabled />
            <Field
              label="Region"
              id="mine_region"
              name="mine_region"
              component={RenderSelect}
              data={props.regionDropdownOptions}
              disabled
            />
          </Col>
          <Col md={12} sm={24}>
            <Field
              id="latitude"
              label="Lat"
              name="latitude"
              component={RenderField}
              disabled
              validate={[lat]}
            />
            <Field
              id="longitude"
              label="Long"
              name="longitude"
              component={RenderField}
              disabled
              validate={[lon]}
            />
            <Field
              label="Type of Administrative Amendment"
              required
              id="notice_of_work_type_code"
              name="notice_of_work_type_code"
              component={RenderSelect}
              data={filteredApplicationTypeOptions}
              disabled={noticeOfWorkTypeDropDownDisabled}
              validate={[required]}
            />
            <Field
              label="Type of Application"
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
            <Field
              id="proposed_end_date"
              name="proposed_end_date"
              component={RenderDate}
              disabled
            />
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div>
      <FormWrapper onSubmit={() => { }}
        initialValues={props.initialValues}
        name={FORM.EDIT_NOTICE_OF_WORK}
        reduxFormConfig={{
          touchOnChange: false,
          touchOnBlur: true,
          enableReinitialize: true,
        }}
      >
        <ScrollContentWrapper id="application-info" title="Application Information">
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
        <ScrollContentWrapper id="application-files" title="Application Files">
          <NOWDocuments
            documents={props.documents?.filter(
              ({ now_application_document_sub_type_code }) =>
                now_application_document_sub_type_code === "AAF" ||
                now_application_document_sub_type_code === "MDO"
            )}
            isViewMode={!props.isViewMode}
            disclaimerText="Attach any file revisions or new files requested from the proponent here."
            categoriesToShow={["AAF", "MDO"]}
            isStandardDocuments
          />
        </ScrollContentWrapper>
      </FormWrapper>
    </div>
  );
};

ReviewAdminAmendmentApplication.propTypes = propTypes;
ReviewAdminAmendmentApplication.defaultProps = defaultProps;
const selector = formValueSelector(FORM.EDIT_NOTICE_OF_WORK);

export default compose(
  connect((state) => ({
    contacts: selector(state, "contacts"),
    now_application_guid: selector(state, "now_application_guid"),
    documents: selector(state, "documents"),
    submission_documents: selector(state, "submission_documents"),
    imported_submission_documents: selector(state, "imported_submission_documents"),
    proposedTonnage: selector(state, "proposed_annual_maximum_tonnage"),
    adjustedTonnage: selector(state, "adjusted_annual_maximum_tonnage"),
    proposedStartDate: selector(state, "proposed_start_date"),
    proposedAuthorizationEndDate: selector(state, "proposed_end_date"),
    regionDropdownOptions: getMineRegionDropdownOptions(state),
    applicationTypeOptions: getDropdownNoticeOfWorkApplicationTypeOptions(state),
    applicationProgressStatusCodes: getNoticeOfWorkApplicationProgressStatusCodeOptions(state),
    permitTypeHash: getNoticeOfWorkApplicationPermitTypeOptionsHash(state),
    userRoles: getUserAccessData(state),
    applicationReasonCodeOptions: getApplicationReasonCodeDropdownOptions(state),
    applicationSourceTypeCodeOptions: getApplicationSourceTypeCodeDropdownOptions(state),
    permits: getPermits(state),
  }))
)(ReviewAdminAmendmentApplication);
