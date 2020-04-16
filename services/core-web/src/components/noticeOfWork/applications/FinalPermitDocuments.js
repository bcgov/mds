import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Icon, Progress, notification } from "antd";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import { getDocumentDownloadState } from "@common/selectors/noticeOfWorkSelectors";
import {
  setNoticeOfWorkApplicationDocumentDownloadState,
  fetchImportedNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { EDIT_OUTLINE } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";
import { COLOR } from "@/constants/styles";
import CustomPropTypes from "@/customPropTypes";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";

/**
 * @class FinalPermitDocuments- call logic surrounding adding or removing documents in the final Permit document list
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  documentDownloadState: CustomPropTypes.documentDownloadState.isRequired,
};

export class FinalPermitDocuments extends Component {
  state = {
    cancelDownload: false,
  };

  createFinalDocumentPackage = (selectedCoreRows) => {
    const documentPayload = this.props.noticeOfWork.documents.map((document) => {
      document.is_final_package = selectedCoreRows.includes(
        document.now_application_document_xref_guid
      );
      return document;
    });
    const payload = { ...this.props.noticeOfWork, documents: documentPayload };
    const message = "Successfully updated the final application package.";

    this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() => {
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => {
            this.props.closeModal();
          });
      });
  };

  cancelDownload = () => {
    this.setState({ cancelDownload: true });
  };

  downloadDocument = (url) => {
    const a = document.createElement("a");
    a.href = url.url;
    a.download = url.filename;
    a.style.display = "none";
    document.body.append(a);
    a.click();
    a.remove();
  };

  waitFor = (conditionFunction) => {
    const poll = (resolve) => {
      if (conditionFunction()) resolve();
      else setTimeout(() => poll(resolve), 400);
    };

    return new Promise(poll);
  };

  downloadDocumentPackage = () => {
    const docURLS = [];
    const permitDocuments = this.props.noticeOfWork.documents.filter(
      ({ is_final_package }) => is_final_package
    );
    let currentFile = 0;
    const totalFiles = permitDocuments.length;
    if (totalFiles === 0) return;

    permitDocuments.forEach((doc) =>
      getDocumentDownloadToken(
        doc.mine_document.document_manager_guid,
        doc.mine_document.document_name,
        docURLS
      )
    );

    this.waitFor(() => docURLS.length === permitDocuments.length).then(async () => {
      // eslint-disable-next-line no-restricted-syntax
      for (const url of docURLS) {
        if (this.state.cancelDownload) {
          this.setState({ cancelDownload: false });
          this.props.setNoticeOfWorkApplicationDocumentDownloadState({
            downloading: false,
            currentFile: 0,
            totalFiles: 1,
          });
          notification.success({
            message: `Cancelled file downloads.`,
            duration: 10,
          });
          return;
        }
        currentFile += 1;
        this.props.setNoticeOfWorkApplicationDocumentDownloadState({
          downloading: true,
          currentFile,
          totalFiles,
        });
        this.downloadDocument(url);
        // eslint-disable-next-line
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      // dispatch toast message
      notification.success({
        message: `Successfully Downloaded: ${totalFiles} files.`,
        duration: 10,
      });

      this.props.setNoticeOfWorkApplicationDocumentDownloadState({
        downloading: false,
        currentFile: 1,
        totalFiles: 1,
      });
    });
  };

  openFinalDocumentPackageModal = (event) => {
    const finalDocuments = this.props.noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);
    event.preventDefault();
    this.props.openModal({
      props: {
        mineGuid: this.props.mineGuid,
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        submissionDocuments: this.props.noticeOfWork.submission_documents,
        documents: this.props.noticeOfWork.documents,
        finalDocuments,
        onSubmit: this.createFinalDocumentPackage,
        title: `Create Final Application Package`,
      },
      content: modalConfig.EDIT_FINAL_PERMIT_DOC_PACKAGE,
    });
  };

  render() {
    const permitDocuments = this.props.noticeOfWork.documents.filter(
      ({ is_final_package }) => is_final_package
    );
    return this.props.documentDownloadState.downloading ? (
      <div className="inline-flex flex-flow-column horizontal-center">
        <h4>Downloading Selected Files...</h4>
        <Progress
          className="padding-md--top padding-large--bottom"
          strokeColor={COLOR.violet}
          type="circle"
          percent={Math.round(
            (this.props.documentDownloadState.currentFile /
              this.props.documentDownloadState.totalFiles) *
              100
          )}
        />
        <Button className="full-mobile" type="secondary" onClick={() => this.cancelDownload()}>
          Cancel
        </Button>
      </div>
    ) : (
      <div>
        <div className="inline-flex between">
          <h3>Final Permit Documents</h3>
          <div>
            <Button
              type="secondary"
              className="full-mobile"
              onClick={() => this.downloadDocumentPackage()}
            >
              <Icon type="download" theme="outlined" className="padding-small--right icon-sm" />
              Download All
            </Button>
            <Button
              type="secondary"
              className="full-mobile"
              onClick={this.openFinalDocumentPackageModal}
            >
              <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
              Edit
            </Button>
          </div>
        </div>
        <br />
        <NOWDocuments
          now_application_guid={this.props.noticeOfWork.now_application_guid}
          mine_guid={this.props.mineGuid}
          documents={permitDocuments}
          isViewMode
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  documentDownloadState: getDocumentDownloadState(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

FinalPermitDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(FinalPermitDocuments);
