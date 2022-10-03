import React from "react";
import PropTypes from "prop-types";
import { timeAgo } from "@common/utils/helpers";

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  author: PropTypes.string.isRequired,
  datetime: PropTypes.string.isRequired,
};

export const MinistryComment = (props) => (
  <React.Fragment>
    <div className="ant-comment-content-author">
      <span className="ant-comment-content-author-name comment-author">{props.author}</span>
      {props.datetime && (
        <span className="ant-comment-content-author-time comment-time">
          {timeAgo(props.datetime, "day")} days ago
        </span>
      )}
    </div>
    <div className="comment">{props.children}</div>
  </React.Fragment>
);

MinistryComment.propTypes = propTypes;

export default MinistryComment;
