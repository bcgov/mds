import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@common/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkReviews,
  getNoticeOfWork,
  getNOWProgress,
} from "@common/selectors/noticeOfWorkSelectors";
import { EDIT_OUTLINE_VIOLET, EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@common/selectors/staticContentSelectors";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import DocumentCompression from "@/components/common/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";

/**
 * @constant PermitPackage renders edit/view for the Permit Package review step
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  isAdminView: PropTypes.bool,
  isTableHeaderView: PropTypes.bool,
};

const defaultProps = {
  isTableHeaderView: false,
  isAdminView: false,
  importNowSubmissionDocumentsJob: {},
};

export class PermitPackage extends Component {
  state = {
    isCompressionModal: false,
    isCompressionInProgress: false,
    documents: [],
  };

  createFinalDocumentPackage = (selectedCoreRows, selectedSubmissionRows) => {
    const documentsPayload = this.props.noticeOfWork.documents.map((document) => {
      document.is_final_package = selectedCoreRows.includes(
        document.now_application_document_xref_guid
      );
      return document;
    });

    const submissionDocumentsPayload = this.props.noticeOfWork.filtered_submission_documents.map(
      (document) => {
        document.is_final_package = selectedSubmissionRows.includes(document.mine_document_guid);
        return document;
      }
    );

    const payload = {
      ...this.props.noticeOfWork,
      documents: documentsPayload,
      submission_documents: submissionDocumentsPayload,
    };

    const message = "Successfully updated the permit package.";

    return this.props
      .updateNoticeOfWorkApplication(payload, this.props.noticeOfWork.now_application_guid, message)
      .then(() =>
        this.props
          .fetchImportedNoticeOfWorkApplication(this.props.noticeOfWork.now_application_guid)
          .then(() => this.props.closeModal())
      );
  };

  downloadDocumentPackage = () => {
    const mineGuid = this.props.noticeOfWork?.mine_guid;
    const submissionDocs = this.props.noticeOfWork.filtered_submission_documents
      .filter(({ is_final_package }) => is_final_package)
      .map(
        (doc) =>
          new MineDocument({
            mine_document_guid: doc.mine_document_guid,
            mine_guid: mineGuid,
            document_manager_guid: doc.document_manager_guid,
            document_name: doc.filename,
          })
      );

    const coreDocs = this.props.noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map(
        (doc) =>
          new MineDocument({
            mine_document_guid: doc.now_application_document_xref_guid,
            mine_guid: mineGuid,
            document_manager_guid: doc.mine_document.document_manager_guid,
            document_name: doc.mine_document.document_name,
          })
      );

    const totalFiles = submissionDocs.length + coreDocs.length;
    if (totalFiles === 0) {
      return;
    }

    this.setState({
      isCompressionModal: true,
      documents: [...coreDocs, ...submissionDocs],
    });
  };

  openFinalDocumentPackageModal = (event) => {
    event.preventDefault();

    const isNoWApplication = this.props.noticeOfWork.application_type_code === "NOW";

    const finalDocuments = this.props.noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);

    const finalSubmissionDocuments = this.props.noticeOfWork.filtered_submission_documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ mine_document_guid }) => mine_document_guid);

    this.props.openModal({
      props: {
        mineGuid: this.props.noticeOfWork.mine_guid,
        noticeOfWorkGuid: this.props.noticeOfWork.now_application_guid,
        noticeOfWork: this.props.noticeOfWork,
        importNowSubmissionDocumentsJob: this.props.importNowSubmissionDocumentsJob,
        submissionDocuments: this.props.noticeOfWork.filtered_submission_documents,
        documents: this.props.noticeOfWork.documents,
        finalDocuments,
        finalSubmissionDocuments,
        onSubmit: this.createFinalDocumentPackage,
        title: "Create Final Application Package",
        isNoWApplication,
      },
      content: modalConfig.EDIT_FINAL_PERMIT_DOC_PACKAGE,
      width: "75vw",
    });
  };

  render() {
    return this.props.isTableHeaderView ? (
      <NOWActionWrapper
        permission={Permission.EDIT_PERMITS}
        tab={this.props.isAdminView ? undefined : "REV"}
      >
        <Button ghost type="primary" size="small" onClick={this.openFinalDocumentPackageModal}>
          <img name="remove" src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
        </Button>
      </NOWActionWrapper>
    ) : (
      <div>
        <DocumentCompression
          documentType={"all"}
          rows={this.state.documents}
          setCompressionModalVisible={(state) => this.setState({ isCompressionModal: state })}
          isCompressionModalVisible={this.state.isCompressionModal}
          compressionInProgress={(state) => this.setState({ isCompressionInProgress: state })}
          showDownloadWarning={false}
        />
        <Button
          type="secondary"
          className="full-mobile"
          onClick={() => this.downloadDocumentPackage()}
          disabled={this.state.isCompressionInProgress}
        >
          <DownloadOutlined className="padding-sm--right icon-sm" />
          Download All
        </Button>
        <NOWActionWrapper
          permission={Permission.EDIT_PERMITS}
          tab={this.props.isAdminView ? undefined : "REV"}
        >
          <Button
            type="secondary"
            className="full-mobile"
            onClick={this.openFinalDocumentPackageModal}
          >
            <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
            Edit
          </Button>
        </NOWActionWrapper>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
  noticeOfWorkReviewTypes: getDropdownNoticeOfWorkApplicationReviewTypeOptions(state),
  progress: getNOWProgress(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
    },
    dispatch
  );

PermitPackage.propTypes = propTypes;
PermitPackage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(PermitPackage);
