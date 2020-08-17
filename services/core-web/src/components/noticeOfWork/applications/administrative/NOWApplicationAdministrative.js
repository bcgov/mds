import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";
import NOWSecurities from "@/components/noticeOfWork/applications/administrative/NOWSecurities";
import NOWDocuments from "@/components/noticeOfWork/applications//NOWDocuments";

/**
 * @class NOWApplicationAdministrative- contains all information relating to the Administrative work on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
  handleSaveNOWEdit: PropTypes.func.isRequired,
};
const governmentDocuments = ["CAL", "WDL", "RJL", "OTH"];
export const NOWApplicationAdministrative = (props) => {
  return (
    <div className="page__content">
      <FinalPermitDocuments mineGuid={props.mineGuid} noticeOfWork={props.noticeOfWork} />
      <br />
      <NOWSecurities
        mineGuid={props.mineGuid}
        noticeOfWork={props.noticeOfWork}
        handleSaveNOWEdit={props.handleSaveNOWEdit}
      />
      <br />
      <h3>Government Documents</h3>
      <br />
      <NOWDocuments
        now_application_guid={props.noticeOfWork.now_application_guid}
        mine_guid={props.mineGuid}
        documents={props.noticeOfWork.documents.filter(({ now_application_document_type_code }) =>
          governmentDocuments.includes(now_application_document_type_code)
        )}
        isViewMode={false}
        isAdminView
        disclaimerText="In this table, please add all transitory, internal documents that may be related to the Notice of Work. All documents added to this section will not show up in the final application package unless otherwise specified."
        categoriesToShow={governmentDocuments}
        handleAfterUpload={props.handleSaveNOWEdit}
      />
    </div>
  );
};

NOWApplicationAdministrative.propTypes = propTypes;

export default NOWApplicationAdministrative;
