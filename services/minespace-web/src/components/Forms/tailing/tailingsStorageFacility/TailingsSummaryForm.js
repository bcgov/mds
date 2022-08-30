import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { compose } from "redux";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import BasicInformation from "@/components/Forms/tailing/tailingsStorageFacility/BasicInformation";
import EngineerOfRecord from "@/components/Forms/tailing/tailingsStorageFacility/EngineerOfRecord";
import { AuthorizationGuard } from "@/HOC/AuthorizationGuard";
import * as Permission from "@/constants/permissions";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      tab: PropTypes.string,
    }),
  }).isRequired,
};

export const TailingsSummaryForm = (props) => {
  const { initialValues, match } = props;

  const renderTabContent = () => {
    switch (match.params.tab) {
      case "basic-information":
        return <BasicInformation initialValues={initialValues} />;
      case "engineer-of-record":
        return <EngineerOfRecord initialValues={initialValues} />;
      case "qualified-person":
        return <div />;
      case "registry-document":
        return <div />;
      case "reports":
        return <div />;
      case "summary":
        return <div />;
      default:
        return <div />;
    }
  };

  return <Form layout="vertical">{renderTabContent()}</Form>;
};

TailingsSummaryForm.propTypes = propTypes;

export default compose(
  reduxForm({
    form: FORM.ADD_TAILINGS_STORAGE_FACILITY,
    touchOnBlur: true,
    touchOnChange: false,
    onSubmit: () => {},
  })
)(withRouter(AuthorizationGuard(Permission.IN_TESTING)(TailingsSummaryForm)));
