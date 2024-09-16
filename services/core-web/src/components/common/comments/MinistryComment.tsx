import React, { FC } from "react";
import { timeAgo } from "@common/utils/helpers";

interface MinistryCommentProps {
  children?: React.ReactNode;
  author: string;
  datetime: string;
}

export const MinistryComment: FC<MinistryCommentProps> = ({ children, author, datetime }) => (
  <React.Fragment>
    <div className="ant-comment-content-author">
      <span className="ant-comment-content-author-name comment-author">{author}</span>
      {datetime && (
        <span className="ant-comment-content-author-time comment-time">
          {timeAgo(datetime, "day")} days ago
        </span>
      )}
    </div>
    <div className="comment">{children}</div>
  </React.Fragment>
);

export default MinistryComment;
