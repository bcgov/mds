import React, { FC, useState } from "react";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { openModal, closeModal } from "@mds/common/redux/actions/modalActions";
import { modalConfig } from "@/components/modalContent/config";
import {
  updateNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
} from "@mds/common/redux/actionCreators/noticeOfWorkActionCreator";
import { getNoticeOfWork } from "@mds/common/redux/selectors/noticeOfWorkSelectors";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import { EDIT_OUTLINE_VIOLET, EDIT_OUTLINE } from "@/constants/assets";
import * as Permission from "@/constants/permissions";
import NOWActionWrapper from "@/components/noticeOfWork/NOWActionWrapper";
import DocumentCompression from "@mds/common/components/documents/DocumentCompression";
import { MineDocument } from "@mds/common/models/documents/document";
import { IImportNoWSubmissionDocumentsJob, INoWApplicationForm } from "@mds/common/interfaces";
import {
  INoWCoreDocument,
  INoWSubmissionDocument,
  IPermitPackageDetails,
} from "@/components/noticeOfWork/applications/permitPackageTitleColumn";

/**
 * @constant PermitPackage renders edit/view for the Permit Package review step
 */

interface PermitPackageProps {
  importNowSubmissionDocumentsJob?: IImportNoWSubmissionDocumentsJob;
  isAdminView?: boolean;
  isTableHeaderView?: boolean;
  // Like Major Projects, warns that previous versions and archived files aren't included in Download All
  showDownloadWarning?: boolean;
}

interface PackageSaveOptions {
  coreTitles?: Record<string, string>;
  submissionTitles?: Record<string, string>;
  coreDetails?: Record<string, IPermitPackageDetails>;
  submissionDetails?: Record<string, IPermitPackageDetails>;
}

export const PermitPackage: FC<PermitPackageProps> = ({
  importNowSubmissionDocumentsJob = {},
  isAdminView = false,
  isTableHeaderView = false,
  showDownloadWarning = false,
}) => {
  const dispatch = useAppDispatch();
  const noticeOfWork = useAppSelector(getNoticeOfWork) as INoWApplicationForm;

  const [isCompressionModal, setIsCompressionModal] = useState(false);
  const [isCompressionInProgress, setIsCompressionInProgress] = useState(false);
  const [documents, setDocuments] = useState<MineDocument[]>([]);

  const createFinalDocumentPackage = (
    selectedCoreRows: string[],
    selectedSubmissionRows: string[],
    {
      coreTitles = {},
      submissionTitles = {},
      coreDetails = {},
      submissionDetails = {},
    }: PackageSaveOptions = {}
  ) => {
    // Type, author and date are saved with the document, so they also show in the single file editor.
    const applyDetails = <T extends INoWCoreDocument | INoWSubmissionDocument>(
      document: T,
      details?: IPermitPackageDetails
    ): T => {
      if (!details) return document;
      return {
        ...document,
        ...(details.type ? { permit_package_document_type_code: details.type } : {}),
        preamble_author: details.author?.trim() || null,
        preamble_date: details.date || null,
      };
    };
    const getTitle = (titles: Record<string, string>, documentGuid: string, currentTitle: string) =>
      documentGuid in titles ? titles[documentGuid]?.trim() : currentTitle;

    const documentsPayload = noticeOfWork.documents.map((document) => {
      const xrefGuid = document.now_application_document_xref_guid;
      const isFinalPackage = selectedCoreRows.includes(xrefGuid);
      const updated = { ...document, is_final_package: isFinalPackage };
      if (!isFinalPackage) return updated;
      updated.preamble_title = getTitle(coreTitles, xrefGuid, document.preamble_title);
      return applyDetails(updated, coreDetails[xrefGuid]);
    });

    const submissionDocumentsPayload = noticeOfWork.filtered_submission_documents.map(
      (document) => {
        const mineDocumentGuid = document.mine_document_guid;
        const isFinalPackage = selectedSubmissionRows.includes(mineDocumentGuid);
        const updated = { ...document, is_final_package: isFinalPackage };
        if (!isFinalPackage) return updated;
        updated.preamble_title = getTitle(
          submissionTitles,
          mineDocumentGuid,
          document.preamble_title
        );
        return applyDetails(updated, submissionDetails[mineDocumentGuid]);
      }
    );

    const payload = {
      ...noticeOfWork,
      documents: documentsPayload,
      submission_documents: submissionDocumentsPayload,
      filtered_submission_documents: submissionDocumentsPayload,
    };

    const message = "Successfully updated the permit package.";

    return dispatch(
      updateNoticeOfWorkApplication(payload, noticeOfWork.now_application_guid, message)
    )
      .then(() => dispatch(fetchImportedNoticeOfWorkApplication(noticeOfWork.now_application_guid)))
      .then(() => dispatch(closeModal()));
  };

  const downloadDocumentPackage = () => {
    const mineGuid = noticeOfWork?.mine_guid;
    const submissionDocs = noticeOfWork.filtered_submission_documents
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

    const coreDocs = noticeOfWork.documents
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

    if (submissionDocs.length + coreDocs.length === 0) {
      return;
    }

    setIsCompressionModal(true);
    setDocuments([...coreDocs, ...submissionDocs]);
  };

  const openFinalDocumentPackageModal = (event) => {
    event.preventDefault();

    const isNoWApplication = noticeOfWork.application_type_code === "NOW";

    const finalDocuments = noticeOfWork.documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ now_application_document_xref_guid }) => now_application_document_xref_guid);

    const finalSubmissionDocuments = noticeOfWork.filtered_submission_documents
      .filter(({ is_final_package }) => is_final_package)
      .map(({ mine_document_guid }) => mine_document_guid);

    dispatch(
      openModal({
        props: {
          mineGuid: noticeOfWork.mine_guid,
          noticeOfWorkGuid: noticeOfWork.now_application_guid,
          noticeOfWork,
          importNowSubmissionDocumentsJob,
          submissionDocuments: noticeOfWork.filtered_submission_documents,
          documents: noticeOfWork.documents,
          finalDocuments,
          finalSubmissionDocuments,
          onSubmit: createFinalDocumentPackage,
          title: "Create Final Application Package",
          isNoWApplication,
        },
        content: modalConfig.EDIT_FINAL_PERMIT_DOC_PACKAGE,
        width: "75vw",
      })
    );
  };

  return isTableHeaderView ? (
    <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={isAdminView ? undefined : "REV"}>
      <Button ghost type="primary" size="small" onClick={openFinalDocumentPackageModal}>
        <img src={EDIT_OUTLINE_VIOLET} alt="Edit document" />
      </Button>
    </NOWActionWrapper>
  ) : (
    <div>
      <DocumentCompression
        documentType="all"
        mineDocuments={documents}
        setCompressionModalVisible={setIsCompressionModal}
        isCompressionModalVisible={isCompressionModal}
        setCompressionInProgress={setIsCompressionInProgress}
        showDownloadWarning={showDownloadWarning}
      />
      <Button
        type="default"
        className="full-mobile"
        onClick={downloadDocumentPackage}
        disabled={isCompressionInProgress}
      >
        <DownloadOutlined className="padding-sm--right icon-sm" />
        Download All
      </Button>
      <NOWActionWrapper permission={Permission.EDIT_PERMITS} tab={isAdminView ? undefined : "REV"}>
        <Button type="default" className="full-mobile" onClick={openFinalDocumentPackageModal}>
          <img src={EDIT_OUTLINE} title="Edit" alt="Edit" className="padding-md--right" />
          <span>Edit</span>
        </Button>
      </NOWActionWrapper>
    </div>
  );
};

export default PermitPackage;
