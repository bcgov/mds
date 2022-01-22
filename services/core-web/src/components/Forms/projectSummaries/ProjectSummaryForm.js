import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
// import { required, dateNotInFuture } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
// import { resetForm, createDropDownList, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
// import {
//   getProjectSummaryStatusCodesHash,
//   getProjectSummaryDocumentTypesHash,
// } from "@common/selectors/staticContentSelectors";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  projectSummaryStatusCodesOptions: CustomPropTypes.options.isRequired,
  projectSummaryDocumentTypesOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  formValues: {},
  initialValues: {},
};

export const ProjectSummaryForm = (props) => {
  const {
    formattedProjectSummary: { contacts, documents },
  } = props;

  const renderContacts = (contacts) => {
    return (
      <>
        <Typography.Title level={4}>Project contacts</Typography.Title>
        <Typography strong>Proponent contacts</Typography>
        <Typography strong>Primary project contact</Typography>
        <Field id="primary_contact_name" name="contacts[0].name" component={renderConfig.FIELD} />
        {contacts[0].job_title && (
          <Field
            id="primary_contact_job_title"
            name="contacts[0].job_title"
            component={renderConfig.FIELD}
          />
        )}
        {contacts[0].company_name && (
          <Field
            id="primary_contact_company_name"
            name="contacts[0].company_name"
            component={renderConfig.FIELD}
          />
        )}
        <Field id="primary_contact_email" name="contacts[0].email" component={renderConfig.FIELD} />
        <Field
          id="primary_contact_phone_number"
          name="contacts[0].phone_number"
          component={renderConfig.FIELD}
        />
        {contacts.length > 1 && <Typography strong>Additional project contacts</Typography>}
        {/* {contacts.length > 1 && contacts.slice(1).map(c => {
          return (
            <Field id="primary_contact_name" name="primary_contact_name" component={renderConfig.FIELD} />
            <Field
              id="primary_contact_job_title"
              name="primary_contact_job_title"
              component={renderConfig.FIELD}
            />
            <Field
              id="primary_contact_company_name"
              name="primary_contact_company_name"
              component={renderConfig.FIELD}
            />
            <Field
              id="primary_contact_email"
              name="primary_contact_email"
              component={renderConfig.FIELD}
            />
            <Field
              id="primary_contact_email"
              name="primary_contact_email"
              component={renderConfig.FIELD}
            />
          )
        })} */}
      </>
    );
  };

  const renderProjectDates = () => {
    return (
      <>
        <Typography.Title level={3}>Project dates requested by proponent</Typography.Title>
        <Typography>
          These are the key dates the proponent hopes to target. A final schedule will be negotiated
          during the pre-application review.
        </Typography>
        <Form.Item>
          <Field
            id="expected_draft_irt_submission_date"
            name="expected_draft_irt_submission_date"
            label="Anticipated draft IRT submission date"
            component={renderConfig.FIELD}
            disabled
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="expected_permit_application_date"
            name="expected_permit_application_date"
            label="Anticipated permit application submission date"
            component={renderConfig.FIELD}
            disabled
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="expected_permit_receipt_date"
            name="expected_permit_receipt_date"
            label="Desired permit issuance date"
            component={renderConfig.FIELD}
            disabled
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="expected_project_start_date"
            name="expected_project_start_date"
            label="Anticipated work start date"
            component={renderConfig.FIELD}
            disabled
          />
        </Form.Item>
      </>
    );
  };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Typography.Title level={3}>Project details</Typography.Title>
      <Form.Item>
        <Field
          id="proponent_project_id"
          name="proponent_project_id"
          label="Project number"
          component={renderConfig.FIELD}
          disabled
        />
      </Form.Item>
      <Form.Item>
        <Field
          id="project_summary_description"
          name="project_summary_description"
          label="Executive summary"
          component={renderConfig.AUTO_SIZE_FIELD}
          disabled
        />
      </Form.Item>
      <Typography.Title level={3}>Authorizations involved</Typography.Title>
      <Typography>
        These are the authorizations the proponent believes may be needed for this project.
        Additional authorizations may be required.
      </Typography>
      {renderProjectDates()}
      {renderContacts(contacts)}
      <Typography.Title level={4}>Documents</Typography.Title>
    </Form>
  );
};

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;

// const mapStateToProps = (state) => ({
//   formValues: getFormValues(FORM.PROJECT_SUMMARY)(state),
// });

// export default compose(
//   connect(mapStateToProps),
//   reduxForm({
//     form: FORM.PROJECT_SUMMARY,
//     enableReinitialize: true,
//   })
// )(ProjectSummaryForm);

export default ProjectSummaryForm;
