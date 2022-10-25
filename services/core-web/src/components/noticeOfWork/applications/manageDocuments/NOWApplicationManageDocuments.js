import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications//NOWSubmissionDocuments";

/**
 * @class NOWApplicationManageDocuments- contains all information relating to the documents on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  isLoaded: PropTypes.bool.isRequired,
  isViewMode: PropTypes.bool,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
};

const defaultProps = { importNowSubmissionDocumentsJob: {}, isViewMode: false };

export const NOWApplicationManageDocuments = (props) => {
  const isNoWApplication = props.noticeOfWork.application_type_code === "NOW";
  const applicationFilesTypes = ["AAF", "AEF", "MDO", "SDO"];
  const tableDescription = isNoWApplication
    ? "In this table, you can see all documents submitted during initial application, revision and new files requested from the proponent. Documents added in this section will not show up in the permit package unless otherwise specified."
    : "In this table, you can see all documents uploaded to the application, revision and new files requested from the proponent. Documents added in this section will not show up in the permit package unless otherwise specified.";
  return (
    <div>
      <ScrollContentWrapper id="permit-package" title="Permit Package" isLoaded={props.isLoaded}>
        <FinalPermitDocuments
          mineGuid={props.mineGuid}
          noticeOfWork={props.noticeOfWork}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          showInUnifiedView
          adminView
          disableCategoryFilter
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="application-documents"
        title="Application Documents"
        isLoaded={props.isLoaded}
      >
        <NOWSubmissionDocuments
          now_application_guid={props.noticeOfWork.now_application_guid}
          documents={props.noticeOfWork.filtered_submission_documents.concat(
            props.noticeOfWork.documents
              ?.filter(
                ({
                  now_application_document_sub_type_code,
                  now_application_document_type_code,
                  mine_document,
                }) =>
                  applicationFilesTypes.includes(now_application_document_sub_type_code) &&
                  (now_application_document_type_code !== "PMT" ||
                    now_application_document_type_code !== "PMA" ||
                    mine_document.document_name.includes("DRAFT"))
              )
              .map((doc) => {
                return {
                  preamble_author: doc.preamble_author,
                  preamble_date: doc.preamble_date,
                  preamble_title: doc.preamble_title,
                  now_application_document_xref_guid: doc.now_application_document_xref_guid,
                  is_referral_package: doc.is_referral_package,
                  is_final_package: doc.is_final_package,
                  is_consultation_package: doc.is_consultation_package,
                  description: doc.description,
                  mine_document_guid: doc.mine_document.mine_document_guid,
                  filename: doc.mine_document.document_name,
                  document_manager_guid: doc.mine_document.document_manager_guid,
                  notForImport: true,
                  ...doc,
                };
              })
          )}
          allowAfterProcess
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          disableCategoryFilter
          displayTableDescription
          tableDescription={tableDescription}
          showDescription
          isAdminView
          isViewMode={props.isViewMode}
          hideJobStatusColumn={!isNoWApplication}
          hideImportStatusColumn={!isNoWApplication}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="government-documents"
        title="Government Documents"
        isLoaded={props.isLoaded}
      >
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ mine_document, now_application_document_sub_type_code }) =>
              mine_document.mine_document_guid && now_application_document_sub_type_code === "GDO"
          )}
          isViewMode={props.isViewMode}
          isAdminView
          allowAfterProcess
          disclaimerText="In this table, add all transitory and internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
          categoriesToShow={["GDO"]}
          isStandardDocuments
          disableCategoryFilter
          showDescription
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="referral-consultation-public-comment-documents"
        title={
          isNoWApplication
            ? "Referral, Consultation and Public Comment Documents"
            : "Referral and Consultation Documents"
        }
        isLoaded={props.isLoaded}
      >
        <NOWDocuments
          documents={props.noticeOfWorkReviews.map((r) => r.documents).flat()}
          isViewMode={props.isViewMode}
          isAdminView
          allowAfterProcess
          disableCategoryFilter
          disclaimerText={
            isNoWApplication
              ? "In this table, you can see all Referral, Consultation and Public Comment related documents. Documents added to this section will not show up unless otherwise specified."
              : "In this table, you can see all Referral and Consultation related documents. Documents added to this section will not show up unless otherwise specified."
          }
          isRefConDocuments
        />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationManageDocuments.propTypes = propTypes;
NOWApplicationManageDocuments.defaultProps = defaultProps;

export default NOWApplicationManageDocuments;
