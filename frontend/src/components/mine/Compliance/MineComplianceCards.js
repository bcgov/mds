import React from "react";
import PropTypes from "prop-types";

/**
 * @class  MineComplianceCards - reusable fixed width cards on the compliance view
 */

const propTypes = {
  content: PropTypes.string.isRequired,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  icon: null,
};

export const MineComplianceCards = (props) => (
  <div className="compliace--card">
    <div className="compliace--card--head">
      <div lassName="compliace--card--head--content">
        <span className="info-display">
          {props.icon && <img src={props.icon} alt="icon" className="padding-small--right" />}
          {props.content}
        </span>
      </div>
    </div>
    <div className="compliace--card--body">
      <h4 className="uppercase">{props.title}</h4>
    </div>
  </div>
);

MineComplianceCards.propTypes = propTypes;
MineComplianceCards.defaultProps = defaultProps;

export default MineComplianceCards;
