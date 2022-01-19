import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
import { required, dateNotInFuture } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { resetForm, createDropDownList, formatDate } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import {
  getProjectSummaryStatusCodesHash,
  getProjectSummaryDocumentTypesHash,
} from "@common/selectors/staticContentSelectors";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  projectSummaryStatusCodesOptions: CustomPropTypes.options.isRequired,
  projectSummaryDocumentTypesOptions: CustomPropTypes.options.isRequired,
};

const defaultProps = {
  formValues: {},
};

export const ProjectSummaryForm = (props) => {
  return (
    <Form layout="vertical">
      <Typography.Title level={3}>Project details</Typography.Title>
      <Field
        id="proponent_project_id"
        name="proponent_project_id"
        label="Project number"
        component={renderConfig.FIELD}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Executive summary"
        component={renderConfig.AUTO_SIZE_FIELD}
      />
      <Typography.Title level={3}>Authorizations involved</Typography.Title>
      <Typography>
        These are the authorizations the proponent believes may be needed for this project.
        Additional authorizations may be required.
      </Typography>
      <Typography.Title level={3}>Project dates requested by proponent</Typography.Title>
      <Typography>
        These are the key dates the proponent hopes to target. A final schedule will be negotiated
        during the pre-application review.
      </Typography>
      <Typography.Title level={3}>Project contacts</Typography.Title>
      <Typography.Title level={4}>Proponent contacts</Typography.Title>
      <Typography.Title level={4}>Primary project contact</Typography.Title>
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
      <Typography.Title level={4}>Additional project contacts</Typography.Title>
      <Typography.Title level={3}>Documents</Typography.Title>
    </Form>
  );
};

ProjectSummaryForm.propTypes = propTypes;
ProjectSummaryForm.defaultProps = defaultProps;
