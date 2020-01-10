import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";

const propTypes = {
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const DownloadDocumentPackageModal = (props) => {
  const [selectedRows, setSelectedRows] = useState([]);
  return (
    <div>
      <NOWSubmissionDocuments
        now_application_guid={props.noticeOfWorkGuid}
        documents={props.submissionDocuments}
        selectedRows={{ selectedRows, setSelectedRows }}
      />
      <Button onClick={() => props.onSubmit(selectedRows)}>Download</Button>
    </div>
  );
};

DownloadDocumentPackageModal.propTypes = propTypes;
export default DownloadDocumentPackageModal;
