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
};

export const ScrollContentWrapper = (props) => {
  const isActive = () =>
    includes(props.id, props.location.hash) ? "circle--purple" : "circle--gray";

  return (
    <div className="scroll">
      <div className={isActive()} />
      <div>{props.children}</div>
    </div>
  );
};

ScrollContentWrapper.propTypes = propTypes;

export default withRouter(ScrollContentWrapper);
