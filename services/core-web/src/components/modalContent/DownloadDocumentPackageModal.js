import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import ReviewNOWDocuments from "@/components/noticeOfWork/applications/review/ReviewNOWDocuments";

const propTypes = {
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const DownloadDocumentPackageModal = (props) => (
  <div>
    <ReviewNOWDocuments
      now_application_guid={props.noticeOfWorkGuid}
      documents={props.submissionDocuments}
    />
  </div>
);

DownloadDocumentPackageModal.propTypes = propTypes;
export default DownloadDocumentPackageModal;
