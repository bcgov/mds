import React from "react";
import PropTypes from "prop-types";

/**
 * @class  MineDashboardContentCards - reusable fixed width cards on the mine view
 */

const propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  icon: null,
};

export const MineDashboardContentCard = (props) => (
  <div className="content--card">
    <div className="content--card--head">
      <div className="content--card--head--content">
        <span className="info-display">
          {props.icon && <img src={props.icon} alt="icon" className="padding-small--right" />}
          {props.content}
        </span>
      </div>
    </div>
    <div className="content--card--body">
      <h4>{props.title}</h4>
    </div>
  </div>
);

MineDashboardContentCard.propTypes = propTypes;
MineDashboardContentCard.defaultProps = defaultProps;

export default MineDashboardContentCard;
