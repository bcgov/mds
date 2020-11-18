import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWSecurities from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";
import ScrollContentWrapper from "@/components/noticeOfWork/applications/ScrollContentWrapper";
import AssignLeadInspector from "@/components/noticeOfWork/applications/verification/AssignLeadInspector";

/**
 * @class NOWApplicationAdministrative- contains all information relating to the Administrative work on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  setLeadInspectorPartyGuid: PropTypes.func.isRequired,
  handleUpdateLeadInspector: PropTypes.func.isRequired,
  importNowSubmissionDocumentsJob: PropTypes.objectOf(PropTypes.any),
};

const defaultProps = { importNowSubmissionDocumentsJob: {} };

const governmentDocuments = ["CAL", "WDL", "RJL", "OTH"];
const exportedDocuments = ["NTR"];
const securityDocuments = ["SRB", "NIA", "AKL", "SCD"];

export const NOWApplicationAdministrative = (props) => {
  return (
    <div className="page__content">
      <ScrollContentWrapper id="application-files" title="Final Application Package">
        <FinalPermitDocuments
          mineGuid={props.mineGuid}
          noticeOfWork={props.noticeOfWork}
          importNowSubmissionDocumentsJob={props.importNowSubmissionDocumentsJob}
          adminView
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="application-files" title="Reclamation Securities">
        <NOWSecurities mineGuid={props.mineGuid} noticeOfWork={props.noticeOfWork} />
        <br />
        <br />
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(({ now_application_document_type_code }) =>
            securityDocuments.includes(now_application_document_type_code)
          )}
          isViewMode={false}
          isAdminView
          disclaimerText="Upload a copy of the security into the table below before sending the original to the Securities Team."
          categoriesToShow={securityDocuments}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="application-files" title="Government Documents">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(({ now_application_document_type_code }) =>
            governmentDocuments.includes(now_application_document_type_code)
          )}
          isViewMode={false}
          isAdminView
          disclaimerText="In this table, please add all transitory, internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
          categoriesToShow={governmentDocuments}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="application-export-files" title="Application Export Files">
        <NOWDocuments
          documents={props.noticeOfWork.documents.filter(({ now_application_document_type_code }) =>
            exportedDocuments.includes(now_application_document_type_code)
          )}
          isViewMode
          disclaimerText="In this table you can see all exported Notice of Work documents."
          categoriesToShow={exportedDocuments}
          addDescriptionColumn={false}
        />
      </ScrollContentWrapper>
      <ScrollContentWrapper id="lead-inspector" title="Lead Inspector">
        <AssignLeadInspector
          inspectors={props.inspectors}
          noticeOfWork={props.noticeOfWork}
          setLeadInspectorPartyGuid={props.setLeadInspectorPartyGuid}
          handleUpdateLeadInspector={props.handleUpdateLeadInspector}
          title="Update Lead Inspector"
          isAdminView
        />
      </ScrollContentWrapper>
    </div>
  );
};

NOWApplicationAdministrative.propTypes = propTypes;
NOWApplicationAdministrative.defaultProps = defaultProps;

export default NOWApplicationAdministrative;
