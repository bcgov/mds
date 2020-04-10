/* eslint-disable */
import React, { useState, Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button, Progress, Icon, Popconfirm } from "antd";
import { getDocumentDownloadState } from "@common/selectors/noticeOfWorkSelectors";
import NOWDocuments from "../noticeOfWork/applications/NOWDocuments";
import { COLOR } from "@/constants/styles";

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
  closeModal: PropTypes.func.isRequired,
};
export const EditFinalPermitDocumentPackage = (props) => {
  const [selectedCoreRows, setSelectedCoreRows] = useState([]);
  return (
    <div>
      <NOWDocuments
        now_application_guid={props.noticeOfWorkGuid}
        mine_guid={props.mineGuid}
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
          onClick={() => props.onSubmit(selectedCoreRows)}
        >
          <Icon type="download" theme="outlined" className="padding-small--right icon-sm" />
          save Application Package
        </Button>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

EditFinalPermitDocumentPackage.propTypes = propTypes;
export default connect(mapStateToProps)(EditFinalPermitDocumentPackage);
