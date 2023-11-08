import React from "react";
import { PropTypes } from "prop-types";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { Spin } from "antd";

const propTypes = {
  isLoaded: PropTypes.bool.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  iconSize: PropTypes.number,
  delay: PropTypes.number,
  tip: PropTypes.string,
};

const defaultProps = {
  iconSize: 80,
  delay: 1000,
  tip: "",
};

export const LoadingWrapper = (props) => {
  return (
    <Spin
      tip={props.tip}
      spinning={!props.isLoaded}
      delay={props.delay}
      indicator={
        <LoadingOutlined
          className="color-primary"
          style={{
            fontSize: props.iconSize,
            marginTop: props.iconSize / 2,
            marginLeft: -(props.iconSize / 2),
          }}
        />
      }
    >
      {props.children}
    </Spin>
  );
};

LoadingWrapper.propTypes = propTypes;
LoadingWrapper.defaultProps = defaultProps;

export default LoadingWrapper;
