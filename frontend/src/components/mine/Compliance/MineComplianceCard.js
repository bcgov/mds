import React from "react";
import PropTypes from "prop-types";

/**
 * @class  MineComplianceCards - reusable fixed width cards on the compliance view
 */

const propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  icon: null,
};

export const MineComplianceCard = (props) => (
  <div className="compliace--card">
    <div className="compliace--card--head">
      <div className="compliace--card--head--content">
        <span className="info-display">
          {props.icon && <img src={props.icon} alt="icon" className="padding-small--right" />}
          {props.content}
        </span>
      </div>
    </div>
    <div className="compliace--card--body">
      <h4>{props.title}</h4>
    </div>
  </div>
);

MineComplianceCard.propTypes = propTypes;
MineComplianceCard.defaultProps = defaultProps;

export default MineComplianceCard;
