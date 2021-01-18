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
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  setIssuingInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateInspectors: PropTypes.func.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { importNowSubmissionDocumentsJob: {} };

const exportedDocuments = ["NTR"];

export const NOWApplicationAdministrative = (props) => {
  return (
    <div>
      <ScrollContentWrapper id="final-application-package" title="Final Application Package">
        <FinalPermitDocuments
          mineGuid={props.mineGuid}
          noticeOfWork={props.noticeOfWork}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          adminView
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="reclamation-securities" title="Reclamation Securities">
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
          disclaimerText="Upload securities-related files here."
          categoriesToShow={["SDO"]}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="government-documents" title="Government Documents">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(
            ({ now_application_document_sub_type_code }) =>
              now_application_document_sub_type_code === "GDO"
          )}
          isViewMode={false}
          isAdminView
          disclaimerText="In this table, add all transitory and internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
          categoriesToShow={["GDO"]}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="generated-documents" title="Application Export Files">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(({ now_application_document_type_code }) =>
            exportedDocuments.includes(now_application_document_type_code)
          )}
          isViewMode
          disclaimerText="This table shows all of the PDF files created from the edited Notice of Work form."
          categoriesToShow={exportedDocuments}
          addDescriptionColumn={false}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="inspectors" title="Inspectors">
        <AssignInspectors
          inspectors={props.inspectors}
          noticeOfWork={props.noticeOfWork}
          setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
          setIssuingInspectorPartyGuid={props.setIssuingInspectorPartyGuid}
          handleUpdateInspectors={props.handleUpdateInspectors}
          title="Update Inspectors"
          isAdminView
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="progress-tracking" title="Application Progress Tracking">
        <NOWProgressTable />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationAdministrative.propTypes = propTypes;
NOWApplicationAdministrative.defaultProps = defaultProps;

export default NOWApplicationAdministrative;
