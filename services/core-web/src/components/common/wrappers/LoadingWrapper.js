import React from "react";
import { PropTypes } from "prop-types";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import * as Style from "@/constants/styles";
/**
 * @constant LoadingWrapper renders react children or loading view
 */

const propTypes = {
  condition: PropTypes.any.isRequired,
  children: PropTypes.element.isRequired,
};

export const LoadingWrapper = (props) => {
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
