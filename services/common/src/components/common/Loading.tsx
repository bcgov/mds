import React from "react";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import { Spin } from "antd";

export const Loading = () => {
  return (
    <div id="loading-screen">
      <Spin
        indicator={
          <LoadingOutlined
            className="loader loader-color"
            style={{
              fontSize: 170,
              marginTop: 70,
            }}
          />
        }
      />
    </div>
  );
};

export default Loading;
