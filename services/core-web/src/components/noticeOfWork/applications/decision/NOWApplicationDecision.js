import React from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import FinalPermitDocuments from "@/components/noticeOfWork/applications/FinalPermitDocuments";

/**
 * @class NOWApplicationDecision- contains all information relating to the decision step on a Notice of Work Application
 */

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  noticeOfWork: CustomPropTypes.importedNOWApplication.isRequired,
};

export const NOWApplicationDecision = (props) => {
  return (
    <div className="page__content">
      <FinalPermitDocuments mineGuid={props.mineGuid} noticeOfWork={props.noticeOfWork} />
    </div>
  );
};

NOWApplicationDecision.propTypes = propTypes;

export default NOWApplicationDecision;
