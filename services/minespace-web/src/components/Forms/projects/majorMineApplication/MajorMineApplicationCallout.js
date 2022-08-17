import React from "react";
import { CALLOUT_SEVERITY } from "@common/constants/strings";
import PropTypes from "prop-types";
import Callout from "@/components/common/Callout";

const propTypes = {
  majorMineApplicationStatus: PropTypes.string.isRequired,
};

const calloutContent = (majorMineApplicationStatus) => {
  switch (majorMineApplicationStatus) {
    case "REC":
      return {
        message:
          "Your Major Mine Application is pending review. No edits can be made at this time.",
        title: "Pending Review",
        severity: CALLOUT_SEVERITY.warning,
      };
    case "UNR":
      return {
        message:
          "Your Major Mine Application is in the process of being reviewed. No edits can be made at this time.",
        title: "In Review",
        severity: CALLOUT_SEVERITY.warning,
      };
    case "APV":
      return {
        message:
          "Your Major Mine Application has been reviewed. Please check your inbox for more information.",
        title: "Review Complete",
        severity: CALLOUT_SEVERITY.success,
      };
    case "CHR":
      return {
        message:
          "Your submission has been reviewed and some changes are required for completing the review process. Please check your inbox for more information.",
        title: "Further information is required",
        severity: CALLOUT_SEVERITY.danger,
      };
    default:
      return {
        message:
          "Please confirm the contents of your submission below. When you are happy with your review click the submit button to begin the review process.",
        title: "Confirm your Submission",
        severity: CALLOUT_SEVERITY.warning,
      };
  }
};

const MajorMineApplicationCallout = (props) => {
  const { majorMineApplicationStatus } = props;
  const { title, message, severity } = calloutContent(majorMineApplicationStatus);

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

MajorMineApplicationCallout.propTypes = propTypes;

export default MajorMineApplicationCallout;
