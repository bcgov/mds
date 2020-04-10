/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Button, Icon, Progress, notification } from "antd";
import {
  downloadNowDocument,
  getNowDocumentDownloadToken,
  getDocumentDownloadToken,
} from "@common/utils/actionlessNetworkCalls";
import { getDocumentDownloadState } from "@common/selectors/noticeOfWorkSelectors";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationReviewDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import { openModal, closeModal } from "@common/actions/modalActions";
import { EDIT_OUTLINE } from "@/constants/assets";
import { modalConfig } from "@/components/modalContent/config";

import * as routes from "@/constants/routes";
import { COLOR } from "@/constants/styles";

import CustomPropTypes from "@/customPropTypes";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";

/**
 * @class FinalPermitDocuments- call logic surrounding adding or removing documents in the final Permit document list
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export class FinalPermitDocuments extends Component {
  state = {
    isLoaded: false,
    cancelDownload: false,
  };

  createFinalDocumentPackage = (selectedCoreRows) => {
    console.log(selectedCoreRows);
    console.log("creating the final application package");
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
          this.props.closeModal();
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
    const finalDocuments = this.props.noticeOfWork.documents.filter(
      ({ is_final_package, now_application_document_xref_guid }) => {
        if (is_final_package) {
          return now_application_document_xref_guid;
        }
      }
    );
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
            {false && (
              <Button
                type="secondary"
                className="full-mobile"
                onClick={this.openFinalDocumentPackageModal}
              >
                <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
                Edit
              </Button>
            )}
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
    { openModal, closeModal, setNoticeOfWorkApplicationDocumentDownloadState },
    dispatch
  );

FinalPermitDocuments.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(FinalPermitDocuments);
