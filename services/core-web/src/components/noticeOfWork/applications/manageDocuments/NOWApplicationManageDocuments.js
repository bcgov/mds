import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";

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
};

const defaultProps = { importNowSubmissionDocumentsJob: {}, isViewMode: true };

export const NOWApplicationManageDocuments = (props) => {
  const isNoWApplication = props.noticeOfWork.application_type_code === "NOW";
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
        title="Additional Application Files"
        isLoaded={props.isLoaded}
      >
        <NOWDocuments
          documents={props.noticeOfWork.documents?.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "AAF" ||
              now_application_document_sub_type_code === "MDO"
          )}
          isViewMode={!props.isViewMode}
          disclaimerText="Attach any file revisions or new files requested from the proponent here."
          categoriesToShow={["AAF", "MDO"]}
        />
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
      {(isNoWApplication || props.draftPermitAmendment?.has_permit_conditions) && (
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
      )}
      <ScrollContentWrapper
        id="referral-consultation-public-comment-documents"
        title="Referral, Consultation and Public Comment Documents"
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
          disclaimerText="In this table, you can see all Referral, Consultation and Public Comment related documents. Documents added to this section will not show up unless otherwise specified."
        />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationManageDocuments.propTypes = propTypes;
NOWApplicationManageDocuments.defaultProps = defaultProps;

export default NOWApplicationManageDocuments;
