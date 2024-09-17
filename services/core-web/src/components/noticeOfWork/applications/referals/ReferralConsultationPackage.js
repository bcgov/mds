import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Button, notification } from "antd";

import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { getDocumentDownloadToken } from "@common/utils/actionlessNetworkCalls";
import {
  createNoticeOfWorkApplicationReview,
  fetchNoticeOfWorkApplicationReviews,
  deleteNoticeOfWorkApplicationReview,
  updateNoticeOfWorkApplicationReview,
  deleteNoticeOfWorkApplicationDocument,
  setNoticeOfWorkApplicationDocumentDownloadState,
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import {
  getNoticeOfWorkReviews,
  getNoticeOfWork,
} from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { getDropdownNoticeOfWorkApplicationReviewTypeOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { modalConfig } from "@/components/modalContent/config";
import CustomPropTypes from "@/customPropTypes";
import { EDIT_OUTLINE_VIOLET } from "@/constants/assets";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import * as Permission from "@/constants/permissions";
import {
  documentsCompression,
  pollDocumentsCompressionProgress,
} from "@mds/common/redux/actionCreators/documentActionCreator";
import { downloadFileFromDocumentManager } from "@mds/core-web/common/utils/actionlessNetworkCalls";

/**
 * @constant ReviewNOWApplication renders edit/view for the NoW Application review step
 */

const propTypes = {
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  openModal: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setNoticeOfWorkApplicationDocumentDownloadState: PropTypes.func.isRequired,
  updateNoticeOfWorkApplication: PropTypes.func.isRequired,
  fetchImportedNoticeOfWorkApplication: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  isTableHeaderView: PropTypes.bool,
  documentsCompression: PropTypes.func,
  pollDocumentsCompressionProgress: PropTypes.func,
  documentType: PropTypes.string,
};

const defaultProps = {
  importNowSubmissionDocumentsJob: {},
  isTableHeaderView: false,
  documentType: "all",
};

export const ReferralConsultationPackage = (props) => {
  const [cancelDownload, setCancelDownload] = useState(false);
  const [zipFileToDownload, setZipFileToDownload] = useState("");

  const progressRef = useRef(false);

  useEffect(() => {
    if (zipFileToDownload) {
      downloadFileFromDocumentManager({ document_manager_guid: zipFileToDownload });
    }
  }, [zipFileToDownload]);

  const downloadDocumentPackage = (selectedCoreRows, selectedSubmissionRows) => {
    const allSelectedRows = [...selectedCoreRows, ...selectedSubmissionRows];

    const coreDocuments = props.noticeOfWork.documents.map((doc) => ({
      document_manager_guid: doc.mine_document.document_manager_guid,
      selected_row_id: doc.now_application_document_xref_guid,
    }));

    const appDocuments = props.noticeOfWork.filtered_submission_documents.map((doc) => ({
      document_manager_guid: doc.document_manager_guid,
      selected_row_id: doc.mine_document_guid,
    }));

    const combineDocumentManagerGuids = [...coreDocuments, ...appDocuments]
      .filter((item) => item.document_manager_guid && item.selected_row_id)
      .filter((item) => allSelectedRows.includes(item.selected_row_id))
      .map((item) => item.document_manager_guid);

    //Making sure no duplicated guids, as the same file can be selected in both tables
    const documentManagerGuids = [...new Set(combineDocumentManagerGuids)];

    const handleCloseCompressionNotification = () => {
      progressRef.current = false;
      notification.close(props.documentType);
      props.compressionInProgress?.(false);
    };

    const displayCompressionNotification = (message, description, duration) => {
      notification.warning({
        key: props.documentType,
        className: `progressNotification-${props.documentType}`,
        message,
        description,
        duration,
        placement: "topRight",
        onClose: handleCloseCompressionNotification,
        top: 85,
      });
    };

    props
      .documentsCompression(props.noticeOfWork.mine_guid, documentManagerGuids)
      .then((response) => {
        const taskId = response.data && response.data.task_id ? response.data.task_id : null;
        displayCompressionNotification("Downloading...", "Compressing files to download", 0);

        if (!taskId) {
          setTimeout(() => {
            displayCompressionNotification(
              "Error starting file compression",
              "An invalid task id was provided",
              10
            );
          }, 2000);
        } else {
          progressRef.current = true;
          props.compressionInProgress?.(true);
          const poll = async () => {
            const { data } = await props.pollDocumentsCompressionProgress(taskId);
            if (data.state !== "SUCCESS" && progressRef.current) {
              setTimeout(poll, 2000);
            } else if (data.state === "SUCCESS" && data?.error.length > 0) {
              displayCompressionNotification(
                "Error compressing files",
                "Unable to retrieve files",
                10
              );
            } else {
              setZipFileToDownload(data.success_docs[0]);
              handleCloseCompressionNotification();
            }
          };
          poll();
        }
      });
  };

  const openDownloadPackageModal = (event) => {
    event.preventDefault();
    const column = props.type === "REF" ? "is_referral_package" : "is_consultation_package";
    const coreDocumentsInPackage = props.noticeOfWork.documents
      .filter((document) => document[column])
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);

    const submissionDocumentsInPackage = props.noticeOfWork.filtered_submission_documents
      .filter((document) => document[column])
      .map(({ mine_document_guid }) => mine_document_guid);

    const isNoWApplication = props.noticeOfWork.application_type_code === "NOW";

    const handleSavePackage = (selectedCoreRows, selectedSubmissionRows) => {
      const packageColumn =
        props.type === "REF" ? "is_referral_package" : "is_consultation_package";
      const documentsPayload = props.noticeOfWork.documents.map((document) => {
        document[packageColumn] = selectedCoreRows.includes(
          document.now_application_document_xref_guid
        );
        return document;
      });

      const submissionDocumentsPayload = props.noticeOfWork.filtered_submission_documents.map(
        (document) => {
          document[packageColumn] = selectedSubmissionRows.includes(document.mine_document_guid);
          return document;
        }
      );

      const payload = {
        ...props.noticeOfWork,
        documents: documentsPayload,
        submission_documents: submissionDocumentsPayload,
      };

      const message =
        props.type === "REF"
          ? "Successfully updated the Referral Package."
          : "Successfully updated the Consultation Package.";

      return props
        .updateNoticeOfWorkApplication(payload, props.noticeOfWork.now_application_guid, message)
        .then(() => {
          props
            .fetchImportedNoticeOfWorkApplication(props.noticeOfWork.now_application_guid)
            .then(() => {
              props.closeModal();
            });
        });
    };

    props.openModal({
      props: {
        noticeOfWorkGuid: props.noticeOfWork.now_application_guid,
        noticeOfWork: props.noticeOfWork,
        importNowSubmissionDocumentsJob: props.importNowSubmissionDocumentsJob,
        coreDocuments: props.noticeOfWork.documents,
        onSubmit: downloadDocumentPackage,
        cancelDownload: () => setCancelDownload(true),
        title: "Download Referral Package",
        submissionDocumentsInPackage,
        coreDocumentsInPackage,
        handleSavePackage,
        type: props.type,
        isNoWApplication,
      },
      content: modalConfig.DOWNLOAD_DOC_PACKAGE,
      width: "75vw",
    });
  };

  const label = props.type === "REF" ? "Referral Package" : "Consultation Package";

  return props.isTableHeaderView ? (
    <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={props.type} isDisabledReviewButton>
      <Button ghost type="primary" size="small" onClick={openDownloadPackageModal}>
        <img name="remove" src={EDIT_OUTLINE_VIOLET} alt={label} />
      </Button>
    </NOWActionWrapper>
  ) : (
    <Button type="secondary" className="full-mobile" onClick={openDownloadPackageModal}>
      {label}
    </Button>
  );
};

const mapStateToProps = (state) => ({
  noticeOfWork: getNoticeOfWork(state),
  noticeOfWorkReviews: getNoticeOfWorkReviews(state),
  noticeOfWorkReviewTypes: getDropdownNoticeOfWorkApplicationReviewTypeOptions(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      openModal,
      closeModal,
      fetchNoticeOfWorkApplicationReviews,
      createNoticeOfWorkApplicationReview,
      deleteNoticeOfWorkApplicationReview,
      updateNoticeOfWorkApplicationReview,
      deleteNoticeOfWorkApplicationDocument,
      setNoticeOfWorkApplicationDocumentDownloadState,
      updateNoticeOfWorkApplication,
      fetchImportedNoticeOfWorkApplication,
      documentsCompression,
      pollDocumentsCompressionProgress,
    },
    dispatch
  );

ReferralConsultationPackage.propTypes = propTypes;
ReferralConsultationPackage.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(ReferralConsultationPackage);
