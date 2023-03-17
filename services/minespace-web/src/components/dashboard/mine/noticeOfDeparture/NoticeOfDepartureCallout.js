import React from "react";
import {
  NOTICE_OF_DEPARTURE_STATUS,
  CALLOUT_SEVERITY,
  NOTICE_OF_DEPARTURE_STATUS_VALUES,
} from "@common/constants/strings";
import PropTypes from "prop-types";
import Callout from "@/components/common/Callout";

const calloutContent = (nodStatus) => {
  switch (nodStatus) {
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.self_determined_non_substantial:
      return {
        message: "This Notice of Departure has been self-determined to be non-substantial.",
        title: NOTICE_OF_DEPARTURE_STATUS.self_determined_non_substantial,
        severity: CALLOUT_SEVERITY.success,
      };
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.determined_non_substantial:
      return {
        message: "This Notice of Departure has been reviewed and determined to be non-substantial.",
        title: NOTICE_OF_DEPARTURE_STATUS.determined_non_substantial,
        severity: CALLOUT_SEVERITY.success,
      };
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.pending_review:
      return {
        message:
          "A notification has been sent to the Ministry that your Notice of Departure has been submitted. Please check MineSpace for updates to your submission status.",
        title: NOTICE_OF_DEPARTURE_STATUS.pending_review,
        severity: CALLOUT_SEVERITY.warning,
      };

    case NOTICE_OF_DEPARTURE_STATUS_VALUES.information_required:
      return {
        message:
          "After reviewing your Notice of Departure we have requested additional information to support the Ministry’s determination. Ministry staff will be in touch with further details.",
        title: NOTICE_OF_DEPARTURE_STATUS.information_required,
        severity: CALLOUT_SEVERITY.warning,
      };
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.in_review:
      return {
        message:
          "Your Notice of Departure is in the process of being reviewed. No edits can be made at this time.",
        title: NOTICE_OF_DEPARTURE_STATUS.in_review,
        severity: CALLOUT_SEVERITY.warning,
      };
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.determined_substantial:
      return {
        message:
          "This Notice of Departure has been reviewed and determined to be substantial. This project must not commence until written authorization is received. This project may be referred to the permit amendment process. Ministry staff will be in touch with further details.",
        title: "Ministry-Determined Substantial",
        severity: CALLOUT_SEVERITY.danger,
      };
    case NOTICE_OF_DEPARTURE_STATUS_VALUES.withdrawn:
      return {
        message: "This Notice of Departure has been withdrawn",
        title: NOTICE_OF_DEPARTURE_STATUS.withdrawn,
        severity: CALLOUT_SEVERITY.danger,
      };
    default:
      return null;
  }
};

const propTypes = {
  nodStatus: PropTypes.string.isRequired,
};

const NoticeOfDepartureCallout = (props) => {
  const { nodStatus } = props;
  const { title, message, severity } = calloutContent(nodStatus);

  return (
    <Callout
      style={{ marginTop: 0 }}
      message={(
        <div className="nod-callout">
          <h4>{title}</h4>
          <p>{message}</p>
        </div>
      )}
      severity={severity}
    />
  );
};

NoticeOfDepartureCallout.propTypes = propTypes;

export default NoticeOfDepartureCallout;
