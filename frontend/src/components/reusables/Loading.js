import React from 'react';
import Lottie from 'react-lottie';
import { Spin } from 'antd';
import * as loader from '@/assets/loader.json';

const Loading = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: loader
  };
  return (
    <div className="loading-screen">
      <div id="loader">
        <Lottie 
          options={defaultOptions}
        />
      </div>
      {/* <Spin id="loader" tip="Loading..." size="large" /> */}
    </div>
  )
}

export default Loading;