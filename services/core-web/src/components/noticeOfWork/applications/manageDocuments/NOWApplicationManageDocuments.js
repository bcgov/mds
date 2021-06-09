import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import NOWSubmissionDocuments from "@/components/noticeOfWork/applications//NOWSubmissionDocuments";

/**
 * @class NOWApplicationManageDocuments- contains all information relating to the Administrative work on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  isLoaded: PropTypes.bool.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
  isViewMode: PropTypes.bool,
  noticeOfWorkReviews: PropTypes.arrayOf(CustomPropTypes.NOWApplicationReview).isRequired,
};

const defaultProps = { importNowSubmissionDocumentsJob: {}, isViewMode: true };

export const NOWApplicationManageDocuments = (props) => {
  const isNoWApplication = props.noticeOfWork.application_type_code === "NOW";
  const applicationFilesTypes = ["AAF", "AEF", "MDO", "SDO"];
  return (
    <div>
      <ScrollContentWrapper
        id="final-application-package"
        title="Final Application Package"
        isLoaded={props.isLoaded}
      >
        <FinalPermitDocuments
          mineGuid={props.mineGuid}
          noticeOfWork={props.noticeOfWork}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          adminView
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="additional-application-files"
        title="Application Documents"
        isLoaded={props.isLoaded}
      >
        <NOWSubmissionDocuments
          now_application_guid={props.now_application_guid}
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
                };
              })
          )}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          displayTableDescription
        />
        {/* <NOWDocuments
          documents={props.noticeOfWork.documents?.filter(
            ({ now_application_document_sub_type_code }) =>
              applicationFilesTypes.includes(now_application_document_sub_type_code)
          )}
          isViewMode={!props.isViewMode}
          disclaimerText="Attach any file revisions or new files requested from the proponent here."
          categoriesToShow={applicationFilesTypes}
        /> */}
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="government-documents"
        title="Government Documents"
        isLoaded={props.isLoaded}
      >
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "GDO"
          )}
          isViewMode={false}
          isAdminView
          allowAfterProcess
          disclaimerText="In this table, add all transitory and internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
          categoriesToShow={["GDO"]}
        />
      </ScrollContentWrapper>
      {/* {(isNoWApplication || props.draftPermitAmendment?.has_permit_conditions) && (
        <ScrollContentWrapper
          id="generated-documents"
          title="Application Export Files"
          //   TODO do we need this section? I do not see it in a design
          isLoaded={props.isLoaded}
        >
          <NOWDocuments
            documents={props.noticeOfWork.documents.filter(
              ({
                now_application_document_sub_type_code,
                now_application_document_type_code,
                mine_document,
              }) =>
                now_application_document_sub_type_code === "AEF" &&
                (now_application_document_type_code !== "PMT" ||
                  now_application_document_type_code !== "PMA" ||
                  mine_document.document_name.includes("DRAFT"))
            )}
            isViewMode={false}
            isAdminView
            allowAfterProcess
            disclaimerText={
              props.noticeOfWork.application_type_code === "NOW"
                ? "This table shows PDFs generated from edited Notice of Work forms and Draft Permits."
                : "This table shows generated Draft Permit PDFs."
            }
            categoriesToShow={["AEF"]}
            addDescriptionColumn={false}
          />
        </ScrollContentWrapper>
      )} */}
      <ScrollContentWrapper
        id="referral-consultation-public-comment-documents"
        title="Referral, Consultation and Public Comment Documents"
        isLoaded={props.isLoaded}
      >
        <NOWDocuments
          documents={props.noticeOfWorkReviews.map((r) => r.documents).flat()}
          isViewMode={false}
          isAdminView
          allowAfterProcess
          disclaimerText="In this table, you can see all Referral, Consultation and Public Comment related documents. Documents added to this section will not show up unless otherwise specified."
        />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationManageDocuments.propTypes = propTypes;
NOWApplicationManageDocuments.defaultProps = defaultProps;

export default NOWApplicationManageDocuments;
