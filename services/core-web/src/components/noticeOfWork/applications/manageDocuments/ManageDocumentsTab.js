import React, { Component } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { getFormValues } from "redux-form";
import { Button } from "antd";
import { openModal, closeModal } from "@common/actions/modalActions";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchNoticeOfWorkApplicationReviews,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWork,
  getImportNowSubmissionDocumentsJob,
  getNoticeOfWorkReviews,
} from "@common/selectors/noticeOfWorkSelectors";
import { getGeneratableNoticeOfWorkApplicationDocumentTypeOptions } from "@common/selectors/staticContentSelectors";
import { getDropdownInspectors } from "@common/selectors/partiesSelectors";
import CustomPropTypes from "@/customPropTypes";
import * as FORM from "@/constants/forms";
import { modalConfig } from "@/components/modalContent/config";
import NOWSideMenu from "@/components/noticeOfWork/applications/NOWSideMenu";
import NOWTabHeader from "@/components/noticeOfWork/applications/NOWTabHeader";
import NOWApplicationManageDocuments from "@/components/noticeOfWork/applications/manageDocuments/NOWApplicationManageDocuments";
import DocumentCompression from "@/components/common/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";

/**
 * @class ManageDocumentsTab- contains all information relating to the documents on a Notice of Work Application.
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchNoticeOfWorkApplicationReviews: PropTypes.func.isRequired,
  fixedTop: PropTypes.bool.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.bool.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  formValues: CustomPropTypes.importedNOWApplication.isRequired,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export class ManageDocumentsTab extends Component {
  state = {
    isInspectorsLoaded: true,
    isCompressionModal: false,
    documents: [],
  };

  componentDidMount = () =>
    this.props.fetchNoticeOfWorkApplicationReviews(this.props.noticeOfWork.now_application_guid);

  handleSaveNOWEdit = () => {
    return this.props
      .updateNoticeOfWorkApplication(
        this.props.formValues,
        this.props.noticeOfWork.now_application_guid
      )
      .then(() => {
        this.props.fetchImportedNoticeOfWorkApplication(
          this.props.noticeOfWork.now_application_guid
        );
      });
  };

  gatherNowDocuments = () => {
    // Gather different types of documents(generated, uploaded, imported)
    const nowDocs = this.props.noticeOfWork.documents;
    const nowReviewDocs = [];
    const nowImportSubmissionDocs = this.props.noticeOfWork.filtered_submission_documents.map(
      (fsb) => ({ ...fsb, is_imported_submission: true })
    );
    this.props.noticeOfWorkReviews.forEach((review) => {
      if (review.documents.length) {
        nowReviewDocs.push(...review.documents);
      }
    });
    return [...nowDocs, ...nowImportSubmissionDocs, ...nowReviewDocs];
  };

  downloadDocumentPackage = (selectedDocumentRows) => {
    const mineGuid = this.props.noticeOfWork?.mine_guid;
    const nowDocs = this.gatherNowDocuments()
      .map(
        (doc) =>
          new MineDocument({
            mine_document_guid: doc.is_imported_submission
              ? doc.mine_document_guid
              : doc.mine_document.mine_document_guid,
            document_manager_guid: doc.is_imported_submission
              ? doc.document_manager_guid
              : doc.mine_document.document_manager_guid,
            document_name: doc.is_imported_submission
              ? doc.filename
              : doc.mine_document.document_name,
            mine_guid: mineGuid,
          })
      )
      .filter((doc) => selectedDocumentRows.includes(doc.mine_document_guid));

    const totalFiles = nowDocs.length;
    if (totalFiles === 0) {
      return;
    }

    this.setState({
      isCompressionModal: true,
      documents: nowDocs,
    });
  };

  openDownloadPackageModal = (event) => {
    event.preventDefault();

    this.props.openModal({
      props: {
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        nowDocuments: this.gatherNowDocuments(),
        onSubmit: this.downloadDocumentPackage,
        title: "Download NoW Documents",
        closeModal: this.props.closeModal,
        afterClose: () => {},
      },
      content: modalConfig.NOW_MANAGE_DOCUMENTS_DOWNLOAD_PACKAGE_MODAL,
      width: "75vw",
    });
  };

  render() {
    return (
      <div>
        <NOWTabHeader
          tab="MND"
          tabName="Manage Documents"
          fixedTop={this.props.fixedTop}
          noticeOfWork={this.props.noticeOfWork}
          showProgressButton={false}
          tabActions={
            <Button
              type="secondary"
              className="full-mobile"
              onClick={this.openDownloadPackageModal}
            >
              Download Documents
            </Button>
          }
        />
        <div className={this.props.fixedTop ? "side-menu--fixed" : "side-menu"}>
          <NOWSideMenu tabSection="manage-documents" />
        </div>
        <div
          className={
            this.props.fixedTop ? "side-menu--content with-fixed-top" : "side-menu--content"
          }
        >
          <DocumentCompression
            documentType={"all"}
            rows={this.state.documents}
            setCompressionModalVisible={(state) => this.setState({ isCompressionModal: state })}
            isCompressionModalVisible={this.state.isCompressionModal}
            showDownloadWarning={false}
          />
          <NOWApplicationManageDocuments
            mineGuid={this.props.noticeOfWork.mine_guid}
            noticeOfWork={this.props.noticeOfWork}
            inspectors={this.props.inspectors}
            importNowSubmissionDocumentsJob={this.props.importNowSubmissionDocumentsJob}
            handleSaveNOWEdit={this.handleSaveNOWEdit}
            isLoaded={this.state.isInspectorsLoaded}
            noticeOfWorkReviews={this.props.noticeOfWorkReviews}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  inspectors: getDropdownInspectors(state),
  formValues: getFormValues(FORM.EDIT_NOTICE_OF_WORK)(state),
  importNowSubmissionDocumentsJob: getImportNowSubmissionDocumentsJob(state),
  generatableApplicationDocuments: getGeneratableNoticeOfWorkApplicationDocumentTypeOptions(state),
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      fetchNoticeOfWorkApplicationReviews,
    },
    dispatch
  );

ManageDocumentsTab.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(ManageDocumentsTab);
