/* eslint-disable */
import React, { Component } from "react";
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

export class NOWApplicationDecision extends Component {
  render() {
    return (
      <div className="page__content">
        <FinalPermitDocuments
          mineGuid={this.props.mineGuid}
          noticeOfWork={this.props.noticeOfWork}
        />
      </div>
    );
  }
}

NOWApplicationDecision.propTypes = propTypes;

export default NOWApplicationDecision;
