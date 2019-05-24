import React from "react";
import { PropTypes } from "prop-types";
import { Spin, Icon } from "antd";

/**
 * @constant LoadingWrapper renders react children || or loading view || null screen
 */

const propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
};

// eslint-disable-next-line react/destructuring-assignment
export const LoadingWrapper = ({ children: Children, ...props }) => {
  console.log(props.condition);
  const antIcon = <Icon type="loading" style={{ fontSize: 50, color: "black" }} spin />;
  return (
    <span>
      {props.condition ? (
        <span>{Children}</span>
      ) : (
        <div id="loading-screen--small">
          <Spin indicator={antIcon} />
        </div>
      )}
    </span>
  );
};

LoadingWrapper.propTypes = propTypes;

export default LoadingWrapper;
