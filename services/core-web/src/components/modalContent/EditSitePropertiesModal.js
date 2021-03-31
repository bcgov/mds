import React from "react";
import PropTypes from "prop-types";
import SitePropertiesForm from "@/components/Forms/permits/SitePropertiesForm";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const EditSitePropertiesModal = (props) => {
  return <SitePropertiesForm {...props} />;
};

EditSitePropertiesModal.propTypes = propTypes;

export default EditSitePropertiesModal;
