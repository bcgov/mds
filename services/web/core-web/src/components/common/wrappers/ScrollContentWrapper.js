import React from "react";
import { withRouter } from "react-router-dom";
import { includes } from "lodash";
import { PropTypes } from "prop-types";
import NullScreen from "@/components/common/NullScreen";

/**
 * @constant ScrollContentWrapper renders react children with an active indicator if the id is in the url.
 */

const propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  title: PropTypes.string.isRequired,
  history: PropTypes.shape({
    location: PropTypes.shape({ state: PropTypes.shape({ currentActiveLink: PropTypes.string }) }),
  }).isRequired,
  showContent: PropTypes.bool,
};

const defaultProps = {
  showContent: true,
};

export const ScrollContentWrapper = (props) => {
  const isActive = () => {
    const currentActiveLink =
      props.history && props.history.location && props.history.location.state
        ? props.history.location.state.currentActiveLink
        : undefined;
    const isActiveLink = includes(currentActiveLink, props.id);
    return isActiveLink ? "circle purple" : "circle grey";
  };

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
        <div className="scroll-wrapper--body">
          {props.showContent ? (
            <span>{props.children}</span>
          ) : (
            <NullScreen type="now-activity" message={props.title} />
          )}
        </div>
      </div>
    </div>
  );
};

ScrollContentWrapper.propTypes = propTypes;
ScrollContentWrapper.defaultProps = defaultProps;

export default withRouter(ScrollContentWrapper);
