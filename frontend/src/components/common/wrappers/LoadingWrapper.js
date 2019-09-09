import React from "react";
import { PropTypes } from "prop-types";
import { Spin, Icon } from "antd";
import { TABLE_SKELETON } from "@/constants/assets";
import * as Style from "@/constants/styles";

/**
 * @constant LoadingWrapper renders react children || or loading view
 */

const propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
  type: PropTypes.oneOf(["spinner", "table-skeleton"]),
};

const defaultProps = {
  type: "spinner",
};

export const LoadingWrapper = (props) => {
  const antIcon = (
    <Icon type="loading" style={{ fontSize: 80, color: Style.COLOR.mediumGrey }} spin />
  );

  const renderLoading = (
    <div className="page__content">
      {props.type === "table-skeleton" && (
        <img src={TABLE_SKELETON} alt="loading" id="table-skeleton" />
      )}
      {props.type === "spinner" && (
        <div className="loading-screen--small">
          <Spin id="spinner" indicator={antIcon} />
        </div>
      )}
    </div>
  );

  return (
    <div>
      {props.condition ? (
        <div className="fade-in">{props.children}</div>
      ) : (
        <div>{renderLoading}</div>
      )}
    </div>
  );
};

LoadingWrapper.propTypes = propTypes;
LoadingWrapper.defaultProps = defaultProps;

export default LoadingWrapper;
