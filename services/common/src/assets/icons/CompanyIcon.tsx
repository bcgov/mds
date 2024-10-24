import React from "react";
import Icon from "@ant-design/icons";

const CompanySvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 3H17C18.1046 3 19 3.89543 19 5V21H5V5C5 3.89543 5.89543 3 7 3Z"
      fill="transparent"
      stroke="#3C3636"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <mask id="path-2-inside-1" fill="white">
      <rect x="7" y="5" width="4" height="3" rx="0.5" />
    </mask>
    <rect
      x="7"
      y="5"
      width="4"
      height="3"
      rx="0.5"
      stroke="#3C3636"
      strokeWidth="2"
      mask="url(#path-2-inside-1)"
    />
    <mask id="path-3-inside-2" fill="white">
      <rect x="13" y="5" width="4" height="3" rx="0.5" />
    </mask>
    <rect
      x="13"
      y="5"
      width="4"
      height="3"
      rx="0.5"
      stroke="#3C3636"
      strokeWidth="2"
      mask="url(#path-3-inside-2)"
    />
    <mask id="path-4-inside-3" fill="white">
      <rect x="7" y="10" width="4" height="3" rx="0.5" />
    </mask>
    <rect
      x="7"
      y="10"
      width="4"
      height="3"
      rx="0.5"
      stroke="#3C3636"
      strokeWidth="2"
      mask="url(#path-4-inside-3)"
    />
    <mask id="path-5-inside-4" fill="white">
      <rect x="13" y="10" width="4" height="3" rx="0.5" />
    </mask>
    <rect
      x="13"
      y="10"
      width="4"
      height="3"
      rx="0.5"
      stroke="#3C3636"
      strokeWidth="2"
      mask="url(#path-5-inside-4)"
    />
    <mask id="path-6-inside-5" fill="white">
      <rect x="13" y="15" width="4" height="6" rx="0.5" />
    </mask>
    <rect
      x="13"
      y="15"
      width="4"
      height="6"
      rx="0.5"
      stroke="#3C3636"
      strokeWidth="2"
      mask="url(#path-6-inside-5)"
    />
  </svg>
);

const CompanyIcon = (props) => <Icon component={CompanySvg} {...props} />;

export default CompanyIcon;
