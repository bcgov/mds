import React from "react";
import { Col } from "antd";
import hoistNonReactStatics from "hoist-non-react-statics";

const xs = 24;
const lg = 22;
const xl = 20;
const xxl = 18;

/**
 * Applied at the route level to wrap the component in a column
 * in order to apply consistent margins on pages, while allowing
 * some pages to take up the full width by not applying the HOC
 */
const ColumnWrapper = () => (WrappedComponent) => {
  const columnWrapper = (props) => {
    return (
      <Col xs={xs} lg={lg} xl={xl} xxl={xxl} className="app-container-column">
        <WrappedComponent {...props} />
      </Col>
    );
  };
  hoistNonReactStatics(columnWrapper, WrappedComponent);
  return columnWrapper;
};

export default ColumnWrapper;
