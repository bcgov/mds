import React from "react";
import * as Strings from "@/constants/strings";

const QuestionSidebar = () => (
  <div className="sidebar-block">
    <div className="sidebar-block-title">
      <h2 className="side-bar-title">Questions?</h2>
    </div>
    <div className="sidebar-block-content">
      <p>
        We encourage your feedback and would like to hear from you. If you have any questions,
        feedback, or other concerns, please send us an email at&nbsp;
        <a className="underline" href={`mailto:${Strings.MDS_EMAIL}`}>
          {Strings.MDS_EMAIL}
        </a>
        .
      </p>
    </div>
  </div>
);

export default QuestionSidebar;
