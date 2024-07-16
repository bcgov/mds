/**
 * @constant Loading is a full page loading spinner
 */
import React from "react";
import { useSelector } from "react-redux";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import Lottie from "react-lottie";

import coreLoader from "@mds/common/assets/coreLoader.json";
import mineSpaceLoader from "@mds/common/assets/mineSpaceLoader.json";

const Loading = () => {
  const systemFlag = useSelector(getSystemFlag);
  const isCore = systemFlag === SystemFlagEnum.core;
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: isCore ? coreLoader : mineSpaceLoader,
  };
  return (
    <div id="loading-screen">
      <div id="loader">
        <Lottie options={defaultOptions} />
      </div>
    </div>
  );
};

export default Loading;
