import React, { Component } from 'react';
import { Spin } from 'antd';

const Loading = (props) => {
  return (
    <div className="loading-screen">
      <Spin id="loader" tip="Loading..." size="large" />
    </div>
  )
}

export default Loading;