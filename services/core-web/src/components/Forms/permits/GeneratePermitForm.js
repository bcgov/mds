import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { required, dateNotAfterOther, dateNotInFuture } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import { isPlacerAdjustmentFeeValid } from "@common/utils/helpers";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import PreviousAmendmentDocuments from "@/components/noticeOfWork/applications/PreviousAmendmentDocuments";
import Conditions from "@/components/Forms/permits/conditions/Conditions";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import PermitAmendmentTable from "@/components/noticeOfWork/applications/permitGeneration/PermitAmendmentTable";

const propTypes = {
  isAmendment: PropTypes.bool.isRequired,
  initialValues: PropTypes.any.isRequired,
  previousAmendmentDocuments: PropTypes.objectOf(PropTypes.any).isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  isViewMode: PropTypes.bool.isRequired,
  permitAmendmentDropdown: CustomPropTypes.options.isRequired,
  isPermitAmendmentTypeDropDownDisabled: PropTypes.bool.isRequired,
};

export const GeneratePermitForm = (props) => { 

const dateRangeIsValidStart = (value, allValues, props) =>
  dateRangeIsValid(value, allValues.auth_end_date, props);

const dateRangeIsValidEnd = (value, allValues, props) =>
  dateRangeIsValid(allValues.issue_date, value, props);

const dateRangeIsValid = (start, end, props) => {
  const type = props.noticeOfWork.notice_of_work_type_code;
  const proposedTonnage = props.noticeOfWork.proposed_annual_maximum_tonnage;
  const adjustedTonnage = props.noticeOfWork.adjusted_annual_maximum_tonnage;

  if (type === "PLA") {
    return isPlacerAdjustmentFeeValid(proposedTonnage, adjustedTonnage, start, end)
      ? undefined
      : "This value would create an invalid date range for the paid permit fee.";
  }

  return undefined;
};

  return (
  <Form layout="vertical">
    <ScrollContentWrapper id="general-info" title="General Information">
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
              label="Permittee Mailing address"
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

    <ScrollContentWrapper id="authorization" title="Permit Authorizations">
      <>
        <PermitAmendmentTable permit={props.permit} />
        {/* <Row gutter={32}>
          {props.isAmendment && (
            <Col xs={24} md={12}>
              <Field
                id="original_permit_issue_date"
                name="original_permit_issue_date"
                label="Original Permit Issue Date"
                required
                component={renderConfig.DATE}
                validate={[required]}
                disabled
              />
            </Col>
          )}
          <Col xs={24} md={12}>
            <Field
              id="issue_date"
              name="issue_date"
              label={props.isAmendment ? "Amendment Issue Date" : "Issue Date"}
              component={renderConfig.DATE}
              validate={[required]}
              disabled
            />
          </Col>
        </Row>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="auth_end_date"
              name="auth_end_date"
              label="Authorization End Date"
              component={renderConfig.DATE}
              validate={[required]}
              disabled
            />
          </Col>
        </Row> */}
        <br />
        <div className="field-title">
          {props.isAmendment
            ? "Issue Date and Authorization End Date for the Permit Amendment in Process."
            : "Issue Date and Authorization End Date for the Initial Permit in Process."}
        </div>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue Date"
              component={renderConfig.DATE}
               validate={[
                required,
                dateNotInFuture,
                // dateNotAfterOther(props.formValues.auth_end_date),
                dateRangeIsValidStart,
              ]}
              // validate={[required, dateRangeIsValidStart]}
              disabled={props.isViewMode}
            />
          </Col>
          <Col xs={24} md={12}>
            <Field
              id="auth_end_date"
              name="auth_end_date"
              label="Authorization End Date"
              component={renderConfig.DATE}
               validate={[
                required,
                // dateNotBeforeOther(props.formValues.issue_date),
                dateRangeIsValidEnd,
              ]}
              disabled={props.isViewMode}
            />
          </Col>
        </Row>
      </>
    </ScrollContentWrapper>
    <ScrollContentWrapper id="preamble" title="Preamble">
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
              placeholder="Select a Permit amendment type"
              label="Permit amendment type"
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
    <ScrollContentWrapper id="conditions" title="Conditions">
      <Conditions
        isViewMode={props.isViewMode}
        hasSourceConditions={props.noticeOfWork.has_source_conditions}
        isNoWApplication={props.noticeOfWork.application_type_code === "NOW"}
      />
    </ScrollContentWrapper>
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
}

GeneratePermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.GENERATE_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT),
  enableReinitialize: true,
})(GeneratePermitForm);
