import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";

/**
 * @class NOWApplicationAdministrative- contains all information relating to the Administrative work on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const NOWApplicationAdministrative = (props) => {
  return (
    <div className="page__content">
      <FinalPermitDocuments mineGuid={props.mineGuid} noticeOfWork={props.noticeOfWork} />
    </div>
  );
};

NOWApplicationAdministrative.propTypes = propTypes;

export default NOWApplicationAdministrative;
