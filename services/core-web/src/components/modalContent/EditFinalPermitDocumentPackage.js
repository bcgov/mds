import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Popconfirm } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";
import NOWSubmissionDocuments from "../noticeOfWork/applications/NOWSubmissionDocuments";

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  finalDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  finalSubmissionDocuments: PropTypes.arrayOf(PropTypes.strings).isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  mineGuid: PropTypes.string.isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
};

export const EditFinalPermitDocumentPackage = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState(props.finalDocuments);
  const [selectedSubmissionRows, setSelectedSubmissionRows] = useState(
    props.finalSubmissionDocuments
  );
  return (
    <div>
      <h4>vFCBC/NROS Application Files</h4>
      <NOWSubmissionDocuments
        now_application_guid={props.noticeOfWorkGuid}
        documents={props.submissionDocuments}
        importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
        selectedRows={{ selectedSubmissionRows, setSelectedSubmissionRows }}
      />
      <br />
      <h4>Additional Documents</h4>
      <NOWDocuments
        documents={props.documents}
        isViewMode
        selectedRows={{ selectedCoreRows, setSelectedCoreRows }}
      />
      <br />
      <div className="right center-mobile padding-md--top">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          onConfirm={props.closeModal}
          okText="Yes"
          cancelText="No"
        >
          <Button className="full-mobile">Cancel</Button>
        </Popconfirm>
        <Button
          className="full-mobile"
          type="primary"
          onClick={() => props.onSubmit(selectedCoreRows, selectedSubmissionRows)}
        >
          <DownloadOutlined className="padding-small--right icon-sm" />
          Save Application Package
        </Button>
      </div>
    </div>
  );
};

EditFinalPermitDocumentPackage.propTypes = propTypes;
EditFinalPermitDocumentPackage.defaultProps = defaultProps;

export default EditFinalPermitDocumentPackage;
