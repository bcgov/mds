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
  validateSelectOptions,
  requiredList,
} from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import * as FORM from "@/constants/forms";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import NOWDocuments from "@/components/noticeOfWork/applications/NOWDocuments";
import RenderMultiSelect from "@/components/common/RenderMultiSelect";
import RenderDate from "@/components/common/RenderDate";
import { getPermits } from "@mds/common/redux/selectors/permitSelectors";
import { isEmpty } from "lodash";
import * as Strings from "@common/constants/strings";
import ReviewNOWContacts from "./ReviewNOWContacts";

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
            <div className="field-title">Source of Amendment</div>
            <Field
              id="application_source_type_code"
              name="application_source_type_code"
              component={RenderSelect}
              disabled={props.isViewMode}
              validate={[required]}
              data={props.applicationSourceTypeCodeOptions}
            />
            <div className="field-title">Reason for Amendment</div>
            <Field
              id="application_reason_codes"
              name="application_reason_codes"
              component={RenderMultiSelect}
              disabled={props.isViewMode}
              validate={[requiredList]}
              data={props.applicationReasonCodeOptions}
            />
            <div className="field-title">Name of Property</div>
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
            <div className="field-title">Lat</div>
            <Field
              id="latitude"
              name="latitude"
              component={RenderField}
              disabled
              validate={[lat]}
            />
            <div className="field-title">Long</div>
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
              data={filteredApplicationTypeOptions}
              disabled={noticeOfWorkTypeDropDownDisabled}
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
      <Form layout="vertical">
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
      </Form>
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
  })),
  reduxForm({
    form: FORM.EDIT_NOTICE_OF_WORK,
    touchOnChange: false,
    touchOnBlur: true,
    enableReinitialize: true,
    onSubmit: () => {},
  })
)(ReviewAdminAmendmentApplication);
