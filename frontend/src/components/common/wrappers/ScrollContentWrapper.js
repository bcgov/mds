import React from "react";
import { withRouter } from "react-router-dom";
import { includes } from "lodash";
import { PropTypes } from "prop-types";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  location: PropTypes.shape({ hash: PropTypes.string }).isRequired,
  title: PropTypes.string.isRequired,
};

export const ScrollContentWrapper = (props) => {
  const isActive = () =>
    includes(props.location.hash, props.id) ? "circle purple" : "circle grey";

  return (
    <div className="scroll-wrapper">
      <div className="inline-flex">
        <div className={isActive()} />
        <div id={props.id}>
          <div className="scroll-wrapper--title">
            <h3>{props.title}</h3>
          </div>
        </div>
      </div>
      <div className="scroll-wrapper--border">
        <div className="scroll-wrapper--body">{props.children}</div>
      </div>
    </div>
  );
};

ScrollContentWrapper.propTypes = propTypes;

export default withRouter(ScrollContentWrapper);
