import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Progress, Popconfirm } from "antd";
import { getDocumentDownloadState } from "@common/selectors/noticeOfWorkSelectors";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications/NOWSubmissionDocuments";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  nowDocuments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  noticeOfWorkGuid: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  cancelDownload: PropTypes.func.isRequired,
  documentDownloadState: CustomPropTypes.documentDownloadState.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export const ManageDocumentsDownloadPackageModal = (props) => {
  const [selectedDocumentRows, setSelectedDocumentRows] = useState(props.nowDocuments);

  return props.documentDownloadState.downloading ? (
    <div className="inline-flex flex-flow-column horizontal-center">
      <h4>Downloading Selected Files...</h4>
      <Progress
        className="padding-md--top padding-lg--bottom"
        strokeColor={COLOR.violet}
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
    <>
      <div>
        <h4>All NoW Documents</h4>
        <NOWSubmissionDocuments
          now_application_guid={props.noticeOfWorkGuid}
          documents={props.nowDocuments.map((nd) => {
            return {
              filename: nd.mine_document.document_name,
              mine_document_guid: nd.mine_document.mine_document_guid,
              document_manager_guid: nd.mine_document.document_manager_guid,
              ...nd,
            };
          })}
          selectedRows={{
            selectedSubmissionRows: selectedDocumentRows,
            setSelectedSubmissionRows: setSelectedDocumentRows,
          }}
          isAdminView
          isPackageModal
          isViewMode
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
            type="tertiary"
            onClick={() => props.onSubmit(selectedDocumentRows, setSelectedDocumentRows)}
          >
            <DownloadOutlined className="padding-sm--right icon-sm" />
            Download Selected Documents
          </Button>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

ManageDocumentsDownloadPackageModal.propTypes = propTypes;

export default connect(mapStateToProps)(ManageDocumentsDownloadPackageModal);
