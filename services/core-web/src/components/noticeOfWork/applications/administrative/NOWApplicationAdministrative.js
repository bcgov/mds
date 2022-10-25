import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWSecurities from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import AssignInspectors from "@/components/noticeOfWork/applications/verification/AssignInspectors";
import NOWProgressTable from "@/components/noticeOfWork/applications/administrative/NOWProgressTable";

/**
 * @class NOWApplicationAdministrative- contains all information relating to the Administrative work on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  handleUpdateInspectors: PropTypes.func.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
  isLoaded: PropTypes.bool.isRequired,
  draftPermitAmendment: CustomPropTypes.permitAmendment.isRequired,
};

const defaultProps = { importNowSubmissionDocumentsJob: {} };

export const NOWApplicationAdministrative = (props) => {
  const isNoWApplication = props.noticeOfWork.application_type_code === "NOW";
  return (
    <div>
      <ScrollContentWrapper id="permit-package" title="Permit Package" isLoaded={props.isLoaded}>
        <FinalPermitDocuments
          mineGuid={props.mineGuid}
          noticeOfWork={props.noticeOfWork}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          adminView
          showInUnifiedView
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="reclamation-securities"
        title="Reclamation Securities"
        isLoaded={props.isLoaded}
      >
        <NOWSecurities />
        <br />
        <br />
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "SDO"
          )}
          isViewMode={false}
          isAdminView
          allowAfterProcess
          isStandardDocuments
          disclaimerText="Upload securities-related files here."
          categoriesToShow={["SDO"]}
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
          isViewMode={false}
          isAdminView
          allowAfterProcess
          disclaimerText="In this table, add all transitory and internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
          categoriesToShow={["GDO"]}
          isStandardDocuments
        />
      </ScrollContentWrapper>
      {(isNoWApplication || props.draftPermitAmendment?.has_permit_conditions) && (
        <ScrollContentWrapper
          id="generated-documents"
          title="Application Export Files"
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
            isStandardDocuments
          />
        </ScrollContentWrapper>
      )}
      <ScrollContentWrapper id="inspectors" title="Inspectors" isLoaded={props.isLoaded}>
        <AssignInspectors
          inspectors={props.inspectors}
          noticeOfWork={props.noticeOfWork}
          handleUpdateInspectors={props.handleUpdateInspectors}
          title="Update Inspectors"
          isAdminView
          isLoaded={props.isLoaded}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper
        id="progress-tracking"
        title="Application Progress Tracking"
        isLoaded={props.isLoaded}
      >
        <NOWProgressTable />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationAdministrative.propTypes = propTypes;
NOWApplicationAdministrative.defaultProps = defaultProps;

export default NOWApplicationAdministrative;
