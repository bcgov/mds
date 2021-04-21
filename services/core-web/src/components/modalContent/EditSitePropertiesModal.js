import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import SitePropertiesForm from "@/components/Forms/permits/SitePropertiesForm";

const propTypes = {
  initialValues: CustomPropTypes.permit.isRequired,
  permit: CustomPropTypes.permit.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const EditSitePropertiesModal = (props) => {
  return (
    <SitePropertiesForm
      initialValues={props.initialValues}
      permit={props.permit}
      onSubmit={props.onSubmit}
    />
  );
};

EditSitePropertiesModal.propTypes = propTypes;

export default EditSitePropertiesModal;
