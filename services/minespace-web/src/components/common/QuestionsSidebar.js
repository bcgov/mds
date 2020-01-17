import React from "react";
import * as Strings from "@/constants/strings";

const QuestionSidebar = () => (
  <div className="sidebar-block">
    <div className="sidebar-block-title">
      <h2 className="side-bar-title">Questions?</h2>
    </div>
    <div className="sidebar-block-content">
      <p>
        Please let us know about any questions or comments you have regarding your experience using
        MineSpace.
        <br />
        <br />
        Email us at&nbsp;
        <a className="underline" href={`mailto:${Strings.MDS_EMAIL}`}>
          {Strings.MDS_EMAIL}
        </a>
        .
      </p>
    </div>
  </div>
);

export default QuestionSidebar;
