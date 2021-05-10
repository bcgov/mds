import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, getFormValues } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Descriptions, Button } from "antd";
import {
  required,
  dateNotAfterOther,
  dateNotInFuture,
  dateNotBeforeOther,
} from "@common/utils/Validate";
import { resetForm, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";

import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import PreviousAmendmentDocuments from "@/components/noticeOfWork/applications/PreviousAmendmentDocuments";
import Conditions from "@/components/Forms/permits/conditions/Conditions";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import PermitAmendmentTable from "@/components/noticeOfWork/applications/permitGeneration/PermitAmendmentTable";
import UploadPermitDocument from "@/components/noticeOfWork/applications/permitGeneration/UploadPermitDocument";
import ReviewSiteProperties from "@/components/noticeOfWork/applications/review/ReviewSiteProperties";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import { PERMIT } from "@/constants/assets";

const propTypes = {
  isAmendment: PropTypes.bool.isRequired,
  previousAmendmentDocuments: PropTypes.objectOf(PropTypes.any).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  permitAmendmentDropdown: CustomPropTypes.options.isRequired,
  isPermitAmendmentTypeDropDownDisabled: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoaded: PropTypes.bool.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  draftPermit: CustomPropTypes.permit.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
};

export const GeneratePermitForm = (props) => {
  console.log(props.draftPermitAmendment);
  return (
    <Form layout="vertical">
      {!props.draftPermitAmendment.has_permit_conditions && (
        <ScrollContentWrapper id="permit-upload" title="Permit Upload" isLoaded={props.isLoaded}>
          <UploadPermitDocument draftPermitAmendment={props.draftPermitAmendment} />
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper id="general-info" title="General Information" isLoaded={props.isLoaded}>
        <>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="mine_no"
                name="mine_no"
                label="Mine Number"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="permit_number"
                name="permit_number"
                label="Permit Number"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="now_number"
                name="now_number"
                label="Application Number"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="now_tracking_number"
                name="now_tracking_number"
                label="Application Tracking Number"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="permittee"
                name="permittee"
                label="Permittee"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="permittee_mailing_address"
                name="permittee_mailing_address"
                label="Permittee Mailing Address"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="permittee_email"
                name="permittee_email"
                label="Permittee Email"
                component={renderConfig.FIELD}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="mine_location"
                name="mine_location"
                label="Mine Location"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="lead_inspector"
                name="lead_inspector"
                label="Lead Inspector Name"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              {/* this will be converted to a drop-down menu with pre-populated title options, currently defaulting to "Inspector of Mines" and disabled */}
              <Field
                id="issuing_inspector_title"
                name="issuing_inspector_title"
                label="Issuing Inspector Title"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12} />
            <Col xs={24} md={12}>
              <Field
                id="regional_office"
                name="regional_office"
                label="Regional Office"
                component={renderConfig.SELECT}
                validate={[required]}
                data={[
                  { value: "Cranbrook", label: "Cranbrook" },
                  { value: "Kamloops", label: "Kamloops" },
                  { value: "Prince George", label: "Prince George" },
                  { value: "Smithers", label: "Smithers" },
                  { value: "Victoria", label: "Victoria" },
                ]}
                disabled={props.isViewMode}
              />
            </Col>
          </Row>
        </>
      </ScrollContentWrapper>

      <ScrollContentWrapper
        id="authorization"
        title="Permit Authorizations"
        isLoaded={props.isLoaded}
      >
        <>
          <Descriptions column={1}>
            <Descriptions.Item label="Proposed Start Date">
              {formatDate(props.initialValues.proposed_start_date) || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Proposed Authorization End Date">
              {formatDate(props.initialValues.proposed_end_date) || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Proposed Term of Authorization">
              {props.initialValues.proposed_term_of_authorization || "N/A"}
            </Descriptions.Item>
          </Descriptions>

          {props.isAmendment && (
            <>
              <h4>Amendment History</h4>
              <PermitAmendmentTable permit={props.draftPermit} />
              <br />
            </>
          )}
          <br />
          <h4>
            {props.isAmendment
              ? "Issue Date and Authorization End Date for the Permit Amendment in Process."
              : "Issue Date and Authorization End Date for the Initial Permit in Process."}
          </h4>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue Date*"
                component={renderConfig.DATE}
                validate={[
                  required,
                  dateNotInFuture,
                  dateNotAfterOther(props.formValues.auth_end_date),
                ]}
                disabled={props.isViewMode}
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="auth_end_date"
                name="auth_end_date"
                label="Authorization End Date*"
                component={renderConfig.DATE}
                validate={[required, dateNotBeforeOther(props.formValues.issue_date)]}
                disabled={props.isViewMode}
              />
            </Col>
          </Row>
          <Descriptions column={1}>
            <Descriptions.Item label="New Term of Authorization">
              {props.initialValues.term_of_authorization || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        </>
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="site-properties"
        title={
          <>
            Site Properties
            <CoreTooltip title="This information will be included on the permit when it is issued and will determine whether the permittee needs to file inspection fee returns." />
          </>
        }
        isLoaded={props.isLoaded}
      >
        <ReviewSiteProperties
          noticeOfWorkType={props.noticeOfWork.notice_of_work_type_code}
          isViewMode={props.isViewMode}
          initialValues={props.noticeOfWork.site_property}
          draftPermit={props.draftPermit}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="preamble" title="Preamble" isLoaded={props.isLoaded}>
        <>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="application_date"
                name="application_date"
                label="Application Date"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="property"
                name="property"
                label="Property Name"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
          </Row>
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Field
                id="application_type"
                name="application_type"
                label="Notice of Work Permit Type"
                component={renderConfig.FIELD}
                validate={[required]}
                disabled
              />
            </Col>
            <Col xs={24} md={12}>
              <Field
                id="permit_amendment_type_code"
                name="permit_amendment_type_code"
                placeholder="Select a Permit Amendment Type"
                label="Permit Amendment Type"
                doNotPinDropdown
                component={renderConfig.SELECT}
                data={props.permitAmendmentDropdown}
                validate={[required]}
                disabled={props.isViewMode ? true : props.isPermitAmendmentTypeDropDownDisabled}
              />
            </Col>
          </Row>
          <br />
          <FinalPermitDocuments
            mineGuid={props.noticeOfWork.mine_guid}
            noticeOfWork={props.noticeOfWork}
            showPreambleFileMetadata
            editPreambleFileMetadata={!props.isViewMode}
            initialValues={props.initialValues}
          />
          {props.previousAmendmentDocuments && (
            <PreviousAmendmentDocuments
              previousAmendmentDocuments={props.previousAmendmentDocuments}
              editPreambleFileMetadata={!props.isViewMode}
              initialValues={props.initialValues}
            />
          )}
        </>
      </ScrollContentWrapper>
      {props.draftPermitAmendment.has_permit_conditions && (
        <ScrollContentWrapper id="conditions" title="Conditions" isLoaded={props.isLoaded}>
          <Conditions
            isViewMode={props.isViewMode}
            hasSourceConditions={props.noticeOfWork.has_source_conditions}
            isNoWApplication={props.noticeOfWork.application_type_code === "NOW"}
          />
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper id="maps" title="Maps">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "MDO"
          )}
          isViewMode={props.isViewMode}
          disclaimerText="In this table, you can see all the map-related Notice of Work documents."
          categoriesToShow={["MDO"]}
          addDescriptionColumn={false}
        />
      </ScrollContentWrapper>
    </Form>
  );
};

GeneratePermitForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.GENERATE_PERMIT)(state) || {},
});

export default compose(
  connect(mapStateToProps),
  reduxForm({
    form: FORM.GENERATE_PERMIT,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT),
    enableReinitialize: true,
    onSubmit: () => {},
  })
)(GeneratePermitForm);
