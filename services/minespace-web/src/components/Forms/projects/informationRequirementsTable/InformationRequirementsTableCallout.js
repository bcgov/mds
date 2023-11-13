import React from "react";
import { CALLOUT_SEVERITY } from "@mds/common/constants/strings";
import PropTypes from "prop-types";
import Callout from "@/components/common/Callout";

const propTypes = {
  informationRequirementsTableStatus: PropTypes.string.isRequired,
};

const calloutContent = (informationRequirementsTableStatus) => {
  switch (informationRequirementsTableStatus) {
    case "SUB":
      return {
        message:
          "Your IRT is pending review. You can make changes to the final IRT by uploading a new one and resubmit it. No changes can be made once the submission is in review.",
        title: "Pending Review",
        severity: CALLOUT_SEVERITY.warning,
      };
    case "UNR":
      return {
        message: "Your IRT is in the process of being reviewed. No edits can be made at this time.",
        title: "In Review",
        severity: CALLOUT_SEVERITY.warning,
      };
    case "APV":
      return {
        message: "Your IRT has been reviewed. You can proceed to Table of Concordance.",
        title: "Review Complete",
        severity: CALLOUT_SEVERITY.success,
      };
    case "CHR":
      return {
        message:
          "Your submission requires changes, refer to the email from your project lead. Please review before submission.",
        title: "Action Required",
        severity: CALLOUT_SEVERITY.danger,
      };
    default:
      return {
        message: null,
        title: null,
        severity: null,
      };
  }
};

const InformationRequirementsTableCallout = (props) => {
  const { informationRequirementsTableStatus } = props;
  const { title, message, severity } = calloutContent(informationRequirementsTableStatus);

  return (
    <Callout
      message={
        <div className="information-requirements-table-callout">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      }
      severity={severity}
    />
  );
};

InformationRequirementsTableCallout.propTypes = propTypes;

export default InformationRequirementsTableCallout;
