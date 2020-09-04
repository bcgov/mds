import React from "react";
import { PropTypes } from "prop-types";
import { Spin } from "antd";
import * as Style from "@/constants/styles";
import { LoadingOutlined } from "@ant-design/icons";
/**
 * @constant LoadingWrapper renders react children or loading view
 */

const propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.element.isRequired,
};

export const LoadingWrapper = (props) => {
  // const antIcon = (
  //   <Icon type="loading" style={{ fontSize: 80, color: Style.COLOR.mediumGrey }} spin />
  // );
  return (
    <div>
      {props.condition ? (
        <div className="fade-in">{props.children}</div>
      ) : (
        <div className="loading-screen--small">
          <Spin
            id="spinner"
            indicator={<LoadingOutlined style={{ fontSize: 80, color: Style.COLOR.mediumGrey }} />}
          />
        </div>
      )}
    </div>
  );
};

LoadingWrapper.propTypes = propTypes;

export default LoadingWrapper;
