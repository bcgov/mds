import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Progress } from "antd";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";

import { getDocumentDownloadState } from "@/selectors/noticeOfWorkSelectors";

const propTypes = {
  submissionDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  coreDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineGuid: PropTypes.string.isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  cancelDownload: PropTypes.func.isRequired,
  documentDownloadState: PropTypes.shape({
    downloading: PropTypes.bool.isRequired,
    currentFile: PropTypes.number.isRequired,
    totalFiles: PropTypes.number.isRequired,
  }).isRequired,
};
export const DownloadDocumentPackageModal = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState([]);
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState([]);
  return props.documentDownloadState.downloading ? (
    <div className="inline-flex flex-flow-column horizontal-center">
      <h4>Downloading Selected Files...</h4>
      <Progress
        className="padding-md--top padding-large--bottom"
        type="circle"
        percent={Math.round(
          (props.documentDownloadState.currentFile / props.documentDownloadState.totalFiles) * 100
        )}
      />
      <Button className="full-mobile" type="secondary" onClick={() => props.cancelDownload()}>
        Cancel
      </Button>
    </div>
  ) : (
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
      <br />
      <div className="right center-mobile padding-md--top">
        <Button
          className="full-mobile"
          type="primary"
          onClick={() => props.onSubmit(selectedCoreRows, selectedSubmissionRows)}
        >
          Download
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

DownloadDocumentPackageModal.propTypes = propTypes;
export default connect(mapStateToProps)(DownloadDocumentPackageModal);
