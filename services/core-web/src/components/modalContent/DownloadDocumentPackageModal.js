import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "antd";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";

const propTypes = {
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  coreDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export const DownloadDocumentPackageModal = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState([]);
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState([]);
  return (
    <div>
      <h4>Submission Documents (VFCBC/NROS)</h4>
      <NOWSubmissionDocuments
        now_application_guid={props.noticeOfWorkGuid}
        documents={props.submissionDocuments}
        selectedRows={{ selectedSubmissionRows, setSelectedSubmissionRows }}
      />
      <br />
      <h4>Additional Documents</h4>
      <NOWDocuments
        now_application_guid={props.noticeOfWorkGuid}
        mine_guid={props.mineGuid}
        documents={props.coreDocuments}
        isViewMode={true}
        selectedRows={{ selectedCoreRows, setSelectedCoreRows }}
      />
      <Button
        type="secondary"
        onClick={() => props.onSubmit(selectedCoreRows, selectedSubmissionRows)}
      >
        Download
      </Button>
    </div>
  );
};

DownloadDocumentPackageModal.propTypes = propTypes;
export default DownloadDocumentPackageModal;
